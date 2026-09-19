import { STATUTORY_RATES } from '../data/initialData';

/**
 * Checks if a member is eligible to attend a specific meeting
 */
export function isMemberEligibleForMeeting(member, meeting) {
  if (!member || !meeting) return false;

  if (meeting.type === 'Board Meeting') {
    return true; // All members (President, VP, SC Chairs, Ward Members) are Board members
  }

  if (meeting.type === 'Standing Committee Meeting') {
    // President can attend any Standing Committee meeting (Ex-officio) and is eligible for sitting fee
    if (member.designation === 'president') {
      return true;
    }
    // Vice President chairs finance SC
    if (member.designation === 'vice_president' && meeting.committee === 'finance') {
      return true;
    }
    // Member or SC Chair must belong to that specific committee
    return member.standingCommittee === meeting.committee;
  }

  return false;
}

/**
 * Returns sitting fee rate per meeting for a specific member based on designation
 * Members: ₹200, SC Chairperson / VP / President: ₹250
 */
export function getMemberSittingFeeRate(member, rates = STATUTORY_RATES) {
  if (!member) return 200;
  const desig = member.designation || 'member';
  if (rates?.sittingFee && typeof rates.sittingFee === 'object' && rates.sittingFee[desig] !== undefined) {
    return Number(rates.sittingFee[desig]);
  }
  if (desig === 'president' || desig === 'vice_president' || desig === 'sc_chairperson') {
    return 250;
  }
  return Number(rates?.sittingFeePerMeeting) || 200;
}

/**
 * Returns monthly sitting fee ceiling for a specific member based on designation
 * Members: ₹1000 (5 × ₹200), SC Chairperson / VP / President: ₹1250 (5 × ₹250)
 */
export function getMemberSittingFeeCeiling(member, rates = STATUTORY_RATES) {
  if (!member) return 1000;
  const desig = member.designation || 'member';
  const rate = getMemberSittingFeeRate(member, rates);
  if (rates?.monthlySittingFeeCeiling && typeof rates.monthlySittingFeeCeiling === 'object' && rates.monthlySittingFeeCeiling[desig] !== undefined) {
    return Number(rates.monthlySittingFeeCeiling[desig]);
  }
  if (typeof rates?.monthlySittingFeeCeiling === 'number' && rates.monthlySittingFeeCeiling > 0) {
    return Number(rates.monthlySittingFeeCeiling);
  }
  return rate * 5;
}

/**
 * Calculate attendance counts and fee breakdown for a member in a specific month
 */
export function calculateMemberMonthlyFees(member, meetingsForMonth = [], attendanceMap = {}, rates = STATUTORY_RATES) {
  let boardAttended = 0;
  let scAttended = 0;
  let totalBoardEligible = 0;
  let totalScEligible = 0;

  const sittingFeePerMeeting = getMemberSittingFeeRate(member, rates);
  const monthlyCeiling = getMemberSittingFeeCeiling(member, rates);

  if (!member) {
    return {
      boardAttended: 0,
      scAttended: 0,
      totalAttended: 0,
      totalBoardEligible: 0,
      totalScEligible: 0,
      sittingFeePerMeeting,
      earnedSittingFee: 0,
      monthlyCeiling,
      admissibleSittingFee: 0,
      excessCapped: 0,
      fixedHonorarium: 8200,
      phoneAllowance: 0,
      grossPayable: 8200,
      tdsDeduction: 0,
      netPayable: 8200
    };
  }

  (meetingsForMonth || []).forEach(meeting => {
    if (!meeting) return;
    const isEligible = isMemberEligibleForMeeting(member, meeting);
    const isAttended = Boolean(attendanceMap?.[meeting.id]?.[member.id]);

    if (meeting.type === 'Board Meeting') {
      totalBoardEligible += 1;
      if (isAttended) boardAttended += 1;
    } else if (meeting.type === 'Standing Committee Meeting' && isEligible) {
      totalScEligible += 1;
      if (isAttended) scAttended += 1;
    }
  });

  const totalAttended = boardAttended + scAttended;
  const earnedSittingFee = totalAttended * sittingFeePerMeeting;
  const admissibleSittingFee = Math.min(earnedSittingFee, monthlyCeiling);
  const excessCapped = Math.max(0, earnedSittingFee - monthlyCeiling);

  const designationKey = member.designation || 'member';
  const honorariumMap = rates?.honorarium || STATUTORY_RATES.honorarium;

  const fixedHonorarium = Number(honorariumMap?.[designationKey]) || STATUTORY_RATES.honorarium[designationKey] || 8200;
  const phoneAllowance = 0; // Telephone allowance excluded as requested
  const grossPayable = fixedHonorarium + admissibleSittingFee;
  const tdsDeduction = 0; // Standard Grama Panchayat honorarium exemption under statutory limit
  const netPayable = grossPayable - tdsDeduction;

  return {
    boardAttended,
    scAttended,
    totalAttended,
    totalBoardEligible,
    totalScEligible,
    sittingFeePerMeeting,
    earnedSittingFee,
    monthlyCeiling,
    admissibleSittingFee,
    excessCapped,
    fixedHonorarium,
    phoneAllowance,
    grossPayable,
    tdsDeduction,
    netPayable
  };
}

/**
 * Format Indian Rupee currency
 */
export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
}

/**
 * Format Malayalam Number / English Number
 */
export function formatMonthYearMalayalam(monthYearStr) {
  const [year, month] = monthYearStr.split('-');
  const monthNames = [
    'ജനുവരി (January)', 'ഫെബ്രുവരി (February)', 'മാർച്ച് (March)', 'ഏപ്രിൽ (April)',
    'മേയ് (May)', 'ജൂൺ (June)', 'ജൂലൈ (July)', 'ആഗസ്റ്റ് (August)',
    'സെപ്റ്റംബർ (September)', 'ഒക്ടോബർ (October)', 'നവംബർ (November)', 'ഡിസംബർ (December)'
  ];
  const mIndex = parseInt(month, 10) - 1;
  return `${monthNames[mIndex] || month} ${year}`;
}

import { STATUTORY_RATES } from '../data/initialData';

/**
 * Checks if a member is eligible to attend a specific meeting
 */
export function isMemberEligibleForMeeting(member, meeting) {
  if (meeting.type === 'Board Meeting') {
    return true; // All members (President, VP, SC Chairs, Ward Members) are Board members
  }

  if (meeting.type === 'Standing Committee Meeting') {
    // President does not attend SC meetings in Kerala Panchayats
    if (member.designation === 'president') {
      return false;
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
 * Calculate attendance counts and fee breakdown for a member in a specific month
 */
export function calculateMemberMonthlyFees(member, meetingsForMonth, attendanceMap, rates = STATUTORY_RATES) {
  let boardAttended = 0;
  let scAttended = 0;
  let totalBoardEligible = 0;
  let totalScEligible = 0;

  meetingsForMonth.forEach(meeting => {
    const isEligible = isMemberEligibleForMeeting(member, meeting);
    const isAttended = Boolean(attendanceMap[meeting.id]?.[member.id]);

    if (meeting.type === 'Board Meeting') {
      totalBoardEligible += 1;
      if (isAttended) boardAttended += 1;
    } else if (meeting.type === 'Standing Committee Meeting' && isEligible) {
      totalScEligible += 1;
      if (isAttended) scAttended += 1;
    }
  });

  const totalAttended = boardAttended + scAttended;
  const sittingFeePerMeeting = rates.sittingFeePerMeeting || 250;
  const earnedSittingFee = totalAttended * sittingFeePerMeeting;
  const monthlyCeiling = rates.monthlySittingFeeCeiling || 1250;
  const admissibleSittingFee = Math.min(earnedSittingFee, monthlyCeiling);
  const excessCapped = Math.max(0, earnedSittingFee - monthlyCeiling);

  const fixedHonorarium = rates.honorarium[member.designation] || 8200;
  const phoneAllowance = rates.phoneAllowance[member.designation] || 400;
  const grossPayable = fixedHonorarium + admissibleSittingFee + phoneAllowance;
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

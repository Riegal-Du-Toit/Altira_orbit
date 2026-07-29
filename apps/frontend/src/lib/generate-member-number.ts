import { createServerSupabaseClient } from './supabase-server';

/**
 * Generates the next available Altira member number in sequence.
 * Format: ALT00001 (5 digits)
 * @returns Promise<string> - The next available member number (e.g., "ALT00116")
 */
export async function generateNextMemberNumber(): Promise<string> {
  const supabase = createServerSupabaseClient();
  
  try {
    // Get the highest ALT member number first.
    const { data: members, error } = await supabase
      .from('members')
      .select('member_number')
      .ilike('member_number', 'ALT_____')
      .order('member_number', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error fetching highest member number:', error);
      throw error;
    }
    
    if (!members || members.length === 0) {
      return 'ALT00001';
    }
    
    // Extract the numeric part from the highest member number
    const highestNumber = members[0].member_number;
    const numericPart = highestNumber.replace('ALT', '');
    
    if (!/^\d{5}$/.test(numericPart)) {
      console.error('Invalid member number format:', highestNumber);

      const { data: allMembers } = await supabase
        .from('members')
        .select('member_number')
        .ilike('member_number', 'ALT%');
      
      if (allMembers) {
        const validNumbers = allMembers
          .filter(m => /^ALT\d{5}$/.test(m.member_number))
          .map(m => parseInt(m.member_number.replace('ALT', '')))
          .sort((a, b) => b - a);
        
        if (validNumbers.length > 0) {
          const nextNumber = validNumbers[0] + 1;
          return `ALT${String(nextNumber).padStart(5, '0')}`;
        }
      }
      
      return 'ALT00001';
    }
    
    const nextNumber = parseInt(numericPart) + 1;
    
    return `ALT${String(nextNumber).padStart(5, '0')}`;
    
  } catch (error) {
    console.error('Error generating member number:', error);
    throw new Error('Failed to generate member number');
  }
}

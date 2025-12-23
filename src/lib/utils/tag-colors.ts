/**
 * Hash-based color generator for consistent tag colors across the app
 * Uses Java's String.hashCode() algorithm for deterministic color assignment
 */
export const getTagColor = (tagName: string): string => {
    // Generate hash from tag name using Java's hashCode algorithm
    let hash = 0;
    for (let i = 0; i < tagName.length; i++) {
        hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Curated dark/techy color palette that pops on dark backgrounds
    const darkTechyColors = [
        'bg-[#60A5FA] text-black',      // Bright Blue
        'bg-[#4ADE80] text-black',      // Neon Green (brand color)
        'bg-[#C084FC] text-black',      // Purple
        'bg-[#F59E0B] text-black',      // Orange
        'bg-[#EC4899] text-white',      // Pink
        'bg-[#06B6D4] text-black',      // Cyan
        'bg-[#8B5CF6] text-white',      // Violet
        'bg-[#10B981] text-black',      // Emerald
        'bg-[#F97316] text-black',      // Deep Orange
        'bg-[#14B8A6] text-black',      // Teal
    ];
    
    // Map hash to color index
    const colorIndex = Math.abs(hash) % darkTechyColors.length;
    return darkTechyColors[colorIndex];
};

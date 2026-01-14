import { useState, useEffect, RefObject } from 'react';

interface UsePrivacyPolicyScrollProps {
    isMobile: boolean;
    scrollLockRef: RefObject<{ current: boolean }>;
}

export interface ScrollLockRef {
    current: boolean;
}

export const usePrivacyPolicyScroll = ({ isMobile, scrollLockRef }: UsePrivacyPolicyScrollProps) => {
    const [activeSection, setActiveSection] = useState<string>(() => {
        if (typeof window !== 'undefined' && window.innerWidth <= 768) {
            return ''; // No active section on mobile by default
        }
        return 'introduction';
    });

    useEffect(() => {
        // Only enable scroll detection on desktop/laptop, not mobile
        if (isMobile) {
            return; // Exit early on mobile - no scroll detection
        }
        
        const sections = ['introduction', 'information-collect', 'how-we-use', 'data-protection', 'cookies', 'privacy-rights', 'contact'];
        
        let ticking = false;
        let lastActiveSection = sections[0];
        
        const handleScroll = () => {
            // Skip if mobile (check on each scroll in case of resize)
            if (window.innerWidth <= 768) {
                return;
            }
            
            if (ticking || (scrollLockRef.current && scrollLockRef.current.current)) return;
            
            ticking = true;
            requestAnimationFrame(() => {
                if (scrollLockRef.current && scrollLockRef.current.current) {
                    ticking = false;
                    return;
                }
                
                const viewportTop = window.scrollY || document.documentElement.scrollTop;
                const viewportHeight = window.innerHeight;
                const triggerPoint = viewportTop + (viewportHeight * 0.25); // 25% from top for better accuracy
                
                let currentActive = lastActiveSection;
                let bestScore = -Infinity;
                
                // Find the section with maximum visibility in viewport
                const isLastSection = (index: number) => index === sections.length - 1;
                
                sections.forEach((sectionId, index) => {
                    const element = document.getElementById(sectionId);
                    if (!element) return;
                    
                    const rect = element.getBoundingClientRect();
                    const elementTop = viewportTop + rect.top;
                    const elementBottom = elementTop + rect.height;
                    
                    // Get section header position
                    const sectionHeader = element.querySelector('button') || element;
                    const headerRect = sectionHeader.getBoundingClientRect();
                    const headerTop = viewportTop + headerRect.top;
                    
                    // Check if section header is visible in viewport
                    const headerVisible = headerRect.top >= -100 && headerRect.top <= viewportHeight * 0.6;
                    
                    // Calculate visible portion of section
                    const visibleTop = Math.max(viewportTop, elementTop);
                    const visibleBottom = Math.min(viewportTop + viewportHeight, elementBottom);
                    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
                    
                    // Calculate how much of section is visible (percentage)
                    const sectionHeight = elementBottom - elementTop;
                    const visibilityRatio = sectionHeight > 0 ? visibleHeight / sectionHeight : 0;
                    
                    // Check if we're near the bottom of the page (for last section)
                    const documentHeight = document.documentElement.scrollHeight;
                    const scrollBottom = viewportTop + viewportHeight;
                    const isNearBottom = documentHeight - scrollBottom < 100;
                    
                    // Score based on multiple factors
                    let score = 0;
                    
                    // Primary: Header position relative to trigger point
                    if (headerVisible) {
                        const distanceFromTrigger = Math.abs(headerTop - triggerPoint);
                        // Closer to trigger = higher score
                        score = 2000 - (distanceFromTrigger * 2);
                        
                        // Bonus if header is exactly at or above trigger point
                        if (headerTop <= triggerPoint && headerTop >= triggerPoint - 150) {
                            score += 1500;
                        }
                    }
                    
                    // Secondary: If trigger point is within section bounds
                    if (triggerPoint >= elementTop && triggerPoint < elementBottom) {
                        score += 2000;
                    }
                    
                    // Special handling for last section when near bottom
                    if (isLastSection(index) && isNearBottom) {
                        // If we're near the bottom and this is the last section, give it priority
                        if (rect.top <= viewportHeight && rect.bottom > viewportHeight * 0.3) {
                            score += 3000;
                        }
                    }
                    
                    // Tertiary: Visibility ratio (for partially visible sections)
                    if (visibleHeight > 0) {
                        score += visibilityRatio * 400;
                    }
                    
                    // Penalty for sections that are too far above viewport
                    if (rect.bottom < -50) {
                        score -= 1000;
                    }
                    
                    // Penalty for sections that are too far below viewport (except last section)
                    if (rect.top > viewportHeight + 50 && !isLastSection(index)) {
                        score -= 1000;
                    }
                    
                    if (score > bestScore) {
                        bestScore = score;
                        currentActive = sectionId;
                    }
                });
                
                // Only update if we found a valid section and it's different
                if (currentActive && currentActive !== lastActiveSection) {
                    lastActiveSection = currentActive;
                    setActiveSection(currentActive);
                }
                
                ticking = false;
            });
        };
        
        // Initial check after a short delay to ensure DOM is ready
        const initialCheck = setTimeout(() => {
            handleScroll();
        }, 200);
        
        // Listen to scroll events for desktop/laptop
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        return () => {
            clearTimeout(initialCheck);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [isMobile, scrollLockRef]);

    return { activeSection, setActiveSection };
};

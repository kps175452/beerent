// Interactive marks functionality
document.addEventListener('DOMContentLoaded', () => {
    const marks = document.querySelectorAll('.mark');
    const comments = document.querySelectorAll('.comment');
    
    // Create a map of marks to their associated comments
    const markCommentMap = new Map();
    
    marks.forEach(mark => {
        const commentClass = mark.dataset.comment;
        if (!markCommentMap.has(commentClass)) {
            markCommentMap.set(commentClass, []);
        }
        markCommentMap.get(commentClass).push(mark);
    });
    
    // Function to position comments relative to mark
    const positionComments = (mark, comments) => {
        const wrapper = document.querySelector('.screen-wrapper');
        const wrapperWidth = wrapper.offsetWidth;

        // Native DOM offset properties guarantee pixel-perfect positioning regardless of CSS transforms or scrolls!
        const markTop = mark.offsetTop;
        const markLeft = mark.offsetLeft;
        const markWidth = mark.offsetWidth;
        const markHeight = mark.offsetHeight;
        
        const markRight = markLeft + markWidth;
        const markCenterY = markTop + (markHeight / 2);
        
        // Manual logic based on USER_REQUEST: 
        // 1-2 on the left, 3-6 on the right
        const markClass = Array.from(mark.classList).find(c => c.startsWith('mark-'));
        const markNum = markClass.split('-')[1];
        let forceLeft = false;

        // Smart mobile boundary check: if comment on right would spill outside the wrapper
        if (window.innerWidth <= 1100) {
            const commentWidth = 260; // Approximate max width
            if (markRight + commentWidth + 20 > wrapperWidth) {
                forceLeft = true;
            }
        }

        const shouldBeOnLeft = (markNum === '1' || markNum === '2') || forceLeft;
        
        // When there are multiple comments, calculate an offset so the whole group is centered
        const cardHeight = 105;
        const startOffset = -((comments.length - 1) * cardHeight / 2);

        comments.forEach((comment, index) => {
            if (markNum === '6' && !forceLeft) {
                // Special case for mark-6: below the point, aligned by right edge
                const markBottom = markTop + markHeight;
                comment.style.top = `${markBottom + 12}px`;
                comment.style.right = `${wrapperWidth - markRight}px`;
                comment.style.left = 'auto';
                comment.style.transform = 'translateY(0) scale(1)';
                if (!comment.classList.contains('active')) {
                    comment.style.transform = 'translateY(0) scale(0.9)';
                }
            } else {
                const verticalOffset = startOffset + (index * cardHeight);
                comment.style.top = `${markCenterY + verticalOffset}px`;

                if (shouldBeOnLeft) {
                    comment.style.right = `${wrapperWidth - markLeft + 8}px`;
                    comment.style.left = 'auto';
                } else {
                    comment.style.left = `${markRight + 8}px`;
                    comment.style.right = 'auto';
                }
                comment.style.removeProperty('transform');
            }
        });
    };

    // Handle mark interactions (Hover for desktop, Click for mobile)
    marks.forEach(mark => {
        // Desktop Hover
        mark.addEventListener('mouseenter', () => {
            if (window.innerWidth > 1100) {
                const commentClass = mark.dataset.comment;
                const relatedComments = document.querySelectorAll(`.${commentClass}`);
                
                positionComments(mark, relatedComments);
                relatedComments.forEach(comment => {
                    comment.classList.add('active');
                });
            }
        });
        
        mark.addEventListener('mouseleave', () => {
            if (window.innerWidth > 1100) {
                const commentClass = mark.dataset.comment;
                const relatedComments = document.querySelectorAll(`.${commentClass}`);
                
                relatedComments.forEach(comment => {
                    comment.classList.remove('active');
                });
            }
        });

        // Mobile Click
        mark.addEventListener('click', (e) => {
            if (window.innerWidth <= 1100) {
                e.stopPropagation(); // Prevent document click from closing immediately
                
                const commentClass = mark.dataset.comment;
                const relatedComments = document.querySelectorAll(`.${commentClass}`);
                const isActive = relatedComments.length > 0 && relatedComments[0].classList.contains('active');
                
                // Hide all active comments first
                document.querySelectorAll('.comment.active').forEach(c => c.classList.remove('active'));
                
                // If it wasn't already active, show it
                if (!isActive) {
                    positionComments(mark, relatedComments);
                    relatedComments.forEach(comment => {
                        comment.classList.add('active');
                    });
                }
            }
        });
    });
    
    // Close comments on outside click for mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1100) {
            if (!e.target.closest('.mark') && !e.target.closest('.comment')) {
                document.querySelectorAll('.comment.active').forEach(c => c.classList.remove('active'));
            }
        }
    });
    
    // Optional: Handle comment hover to keep them visible (Desktop only)
    comments.forEach(comment => {
        comment.addEventListener('mouseenter', () => {
            if (window.innerWidth > 1100) {
                comment.classList.add('active');
            }
        });
        
        comment.addEventListener('mouseleave', () => {
            if (window.innerWidth > 1100) {
                let isMarkHovered = false;
                marks.forEach(m => {
                    if (comment.classList.contains(m.dataset.comment) && m.matches(':hover')) {
                        isMarkHovered = true;
                    }
                });

                if (!isMarkHovered) {
                    comment.classList.remove('active');
                }
            }
        });
    });
    
    // Tag buttons switching
    const tagButtons = document.querySelectorAll('.btn-tag');
    tagButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            tagButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
        });
    });
    
    // Handle header and hero content fade on scroll
    const header = document.querySelector('.header');
    const heroContent = document.querySelector('.hero-content');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const opacity = Math.max(0, 1 - (scrolled / 300));
        
        if (header) {
            header.style.setProperty('opacity', opacity.toString(), 'important');
            header.style.setProperty('visibility', opacity <= 0 ? 'hidden' : 'visible', 'important');
        }
        if (heroContent) {
            heroContent.style.setProperty('opacity', opacity.toString(), 'important');
            heroContent.style.setProperty('visibility', opacity <= 0 ? 'hidden' : 'visible', 'important');
        }
    });

    // Handle mobile dashboard sliding
    const viewport = document.querySelector('.screen-viewport');
    const scrollLeftBtn = document.querySelector('.dash-nav-left');
    const scrollRightBtn = document.querySelector('.dash-nav-right');
    
    if (scrollLeftBtn && scrollRightBtn && viewport) {
        // Set up fade transition on both buttons
        scrollLeftBtn.style.transition = 'opacity 0.4s ease';
        scrollRightBtn.style.transition = 'opacity 0.4s ease';

        const updateButtons = (animate = true) => {
            const isShifted = viewport.classList.contains('shifted');

            if (isShifted) {
                // Show left button on RIGHT side
                scrollLeftBtn.classList.add('on-right');
                if (animate) {
                    scrollRightBtn.style.opacity = '0';
                    setTimeout(() => {
                        scrollRightBtn.style.display = 'none';
                        scrollLeftBtn.style.display = 'flex';
                        setTimeout(() => { scrollLeftBtn.style.opacity = '1'; }, 20);
                    }, 400);
                } else {
                    scrollRightBtn.style.display = 'none';
                    scrollLeftBtn.style.display = 'flex';
                    scrollLeftBtn.style.opacity = '1';
                }
            } else {
                // Show right button on LEFT side
                scrollLeftBtn.classList.remove('on-right');
                if (animate) {
                    scrollLeftBtn.style.opacity = '0';
                    setTimeout(() => {
                        scrollLeftBtn.style.display = 'none';
                        scrollRightBtn.style.display = 'flex';
                        setTimeout(() => { scrollRightBtn.style.opacity = '1'; }, 20);
                    }, 400);
                } else {
                    scrollLeftBtn.style.display = 'none';
                    scrollRightBtn.style.display = 'flex';
                    scrollRightBtn.style.opacity = '1';
                }
            }
        };

        scrollRightBtn.addEventListener('click', () => {
            viewport.classList.add('shifted');
            updateButtons(true);
        });

        scrollLeftBtn.addEventListener('click', () => {
            viewport.classList.remove('shifted');
            updateButtons(true);
        });

        // Initial state (no animation)
        updateButtons(false);
    }
});

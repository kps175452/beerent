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
        const container = document.querySelector('.screen-container');
        const containerRect = container.getBoundingClientRect();
        const markRect = mark.getBoundingClientRect();

        const markTop = markRect.top - containerRect.top;
        const markLeft = markRect.left - containerRect.left;
        const markRight = markRect.right - containerRect.left;
        const markCenterY = markTop + (markRect.height / 2);
        
        // Manual logic based on USER_REQUEST: 
        // 1-2 on the left, 3-6 on the right
        const markClass = Array.from(mark.classList).find(c => c.startsWith('mark-'));
        const markNum = markClass.split('-')[1]; // handles mark-1, mark-2-1, mark-3, etc.
        const shouldBeOnLeft = (markNum === '1' || markNum === '2');
        
        comments.forEach((comment, index) => {
            // Stack multiple comments vertically (useful for mark-4)
            const verticalOffset = index * 95; // Approximate height of a comment card
            
            comment.style.top = `${markCenterY + verticalOffset}px`;

            if (shouldBeOnLeft) {
                // Show to the left of the mark
                comment.style.right = `${containerRect.width - markLeft + 8}px`;
                comment.style.left = 'auto';
            } else {
                // Show to the right of the mark
                comment.style.left = `${markRight + 8}px`;
                comment.style.right = 'auto';
            }
        });
    };

    // Handle mark hover
    marks.forEach(mark => {
        mark.addEventListener('mouseenter', () => {
            const commentClass = mark.dataset.comment;
            const relatedComments = document.querySelectorAll(`.${commentClass}`);
            
            positionComments(mark, relatedComments);
            relatedComments.forEach(comment => {
                comment.classList.add('active');
            });
        });
        
        mark.addEventListener('mouseleave', () => {
            const commentClass = mark.dataset.comment;
            const relatedComments = document.querySelectorAll(`.${commentClass}`);
            
            relatedComments.forEach(comment => {
                comment.classList.remove('active');
            });
        });
    });
    
    // Optional: Handle comment hover to keep them visible
    comments.forEach(comment => {
        comment.addEventListener('mouseenter', () => {
            comment.classList.add('active');
        });
        
        comment.addEventListener('mouseleave', () => {
            let isMarkHovered = false;
            marks.forEach(m => {
                if (comment.classList.contains(m.dataset.comment) && m.matches(':hover')) {
                    isMarkHovered = true;
                }
            });

            if (!isMarkHovered) {
                comment.classList.remove('active');
            }
        });
    });
    
    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Add your scroll logic here if needed
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
});

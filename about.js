document.addEventListener('DOMContentLoaded', function() {
    const headers = document.querySelectorAll('.section-header');
    
    headers.forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const isCollapsed = content.classList.contains('collapsed');
            
            // Toggle current section
            if (isCollapsed) {
                content.classList.remove('collapsed');
                content.classList.add('expanded');
                this.classList.remove('collapsed');
            } else {
                content.classList.remove('expanded');
                content.classList.add('collapsed');
                this.classList.add('collapsed');
            }
        });
    });
    
    // Collapse all sections except "What is 1337+Helper?" by default
    const sectionsToCollapse = [
        'screenshots-header',
        'features-header',
        'formats-header',
        'test-header',
        'how-to-use-header',
    ];
    
    sectionsToCollapse.forEach(id => {
        const header = document.getElementById(id);
        if (header) {
            const content = header.nextElementSibling;
            content.classList.remove('expanded');
            content.classList.add('collapsed');
            header.classList.add('collapsed');
        }
    });
});
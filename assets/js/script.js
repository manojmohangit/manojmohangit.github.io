document.addEventListener('DOMContentLoaded', function () {
    const themeBtn = document.getElementById('theme-toggle');
    const html = document.documentElement;
    const nav = document.querySelector('.nav');

    const savedTheme = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    themeBtn.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    const data = window.portfolioData;

    const socialsContainer = document.getElementById('hero-socials');
    if (socialsContainer && data.bio.socials) {
        data.bio.socials.forEach(social => {
            const a = document.createElement('a');
            a.href = social.link;
            a.target = "_blank";
            a.textContent = social.name;
            socialsContainer.appendChild(a);
        });
    }

    const projectsGrid = document.getElementById('featured-projects');
    if (projectsGrid && data.projects) {
        data.projects.slice(0, 4).forEach((proj, index) => {
            const item = document.createElement('a');
            item.href = proj.link;
            item.target = "_blank";
            item.className = 'bento-item reveal';

            const spans = [7, 5, 5, 7];
            item.style.gridColumn = `span ${spans[index % spans.length]}`;

            item.innerHTML = `
                <span class="bento-id">${proj.id} // PROJECT</span>
                <h3 class="bento-title">${proj.title}</h3>
                <p class="bento-desc">${proj.description}</p>
                <div class="bento-tech">
                    ${proj.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
                </div>
            `;
            projectsGrid.appendChild(item);
        });
    }

    async function fetchBlogPosts() {
        const postsGrid = document.getElementById('latest-posts');
        if (!postsGrid) return;

        postsGrid.innerHTML = '<div class="bento-item reveal active" style="grid-column: span 12; border: 1px dashed var(--muted);"><span class="bento-id">#FETCHING_LOGS...</span><h3 class="bento-title">SYNCHRONIZING_WITH_EXTERNAL_NODES</h3></div>';

        try {
            // Fetch local posts
            let localPosts = [];
            try {
                const localResponse = await fetch('./assets/data/local-posts.json');
                if (localResponse.ok) {
                    localPosts = await localResponse.json();
                }
            } catch (e) {
                console.warn('Could not load local posts:', e);
            }

            const devtoResponse = await fetch('https://dev.to/api/articles?username=manoj_004d');
            const devtoPosts = await devtoResponse.json();

            const mediumResponse = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@manojmohandev');
            const mediumData = await mediumResponse.json();
            const mediumPosts = mediumData.items || [];

            const isHomePage = !!document.getElementById('hero-socials');

            const unifiedPosts = [
                ...localPosts.map(p => ({
                    ...p,
                    date: new Date(p.date),
                    tags: p.tags || []
                })),
                ...devtoPosts.map(p => ({
                    title: p.title,
                    date: new Date(p.published_at),
                    dateStr: new Date(p.published_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase(),
                    excerpt: p.description,
                    link: p.url,
                    source: 'DEV.TO',
                    tags: p.tag_list || []
                })),
                ...mediumPosts.map(p => ({
                    title: p.title,
                    date: new Date(p.pubDate),
                    dateStr: new Date(p.pubDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase(),
                    excerpt: p.description.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...',
                    link: p.link,
                    source: 'MEDIUM',
                    tags: p.categories || []
                }))
            ];

            unifiedPosts.sort((a, b) => b.date - a.date);

            postsGrid.innerHTML = '';

            unifiedPosts.forEach((post, index) => {
                const item = document.createElement('a');
                item.href = post.link;
                if (post.source !== 'DEV BLOG') {
                    item.target = "_blank";
                }
                item.className = 'bento-item reveal active';

                item.style.gridColumn = isHomePage ? (index < 4 ? `span 6` : `display:none`) : `span 12`;

                if (isHomePage && index >= 4) return; // Only show 4 on home

                const tagsHtml = post.tags && post.tags.length > 0
                    ? `<div class="bento-tech" style="margin-top: 1rem;">
                        ${post.tags.map(t => `<span class="tech-tag">${t.toUpperCase()}</span>`).join('')}
                       </div>`
                    : '';

                item.innerHTML = `
                    <span class="bento-id">${post.dateStr} // ${post.source}</span>
                    <h3 class="bento-title" style="font-size: 1.5rem;">${post.title}</h3>
                    <p class="bento-desc">${post.excerpt}</p>
                    ${tagsHtml}
                `;
                postsGrid.appendChild(item);
            });

            if (unifiedPosts.length === 0) {
                postsGrid.innerHTML = '<div class="bento-item reveal active" style="grid-column: span 12;"><span class="bento-id">#EMPTY_LOG</span><h3 class="bento-title">NO_POSTS_FOUND_ON_NODES</h3></div>';
            }

        } catch (error) {
            console.error('Fetch error:', error);
            postsGrid.innerHTML = '<div class="bento-item reveal active" style="grid-column: span 12; border: 1px solid var(--accent);"><span class="bento-id">#CONNECTION_ERROR</span><h3 class="bento-title">FAILED_TO_SYNC_EXTERNAL_BLOGS</h3><p class="bento-desc">Please check the direct links in the bio section.</p></div>';
        }
    }

    fetchBlogPosts();

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    const expGrid = document.getElementById('experience-grid');
    if (expGrid && data.experience) {
        data.experience.forEach((exp, index) => {
            const item = document.createElement('div');
            item.className = 'bento-item reveal';
            item.style.gridColumn = `span 6`;
            item.innerHTML = `
                <span class="bento-id">${exp.period} // ROLE</span>
                <h3 class="bento-title">${exp.role}</h3>
                <p class="bento-id" style="color: var(--accent); margin-bottom: 1rem;">${exp.company}</p>
                <p class="bento-desc">${exp.description}</p>
            `;
            expGrid.appendChild(item);
            observer.observe(item);
        });
    }

    const fullProjectsGrid = document.getElementById('full-projects-grid');
    if (fullProjectsGrid && data.projects) {
        data.projects.forEach((proj, index) => {
            const item = document.createElement('a');
            item.href = proj.link;
            item.target = "_blank";
            item.className = 'bento-item reveal';
            item.style.gridColumn = `span 6`;
            item.innerHTML = `
                <span class="bento-id">${proj.id} // PROJECT</span>
                <h3 class="bento-title">${proj.title}</h3>
                <p class="bento-desc">${proj.description}</p>
                <div class="bento-tech">
                    ${proj.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
                </div>
            `;
            fullProjectsGrid.appendChild(item);
            observer.observe(item);
        });
    }

    const certsGrid = document.getElementById('certs-grid');
    if (certsGrid && data.certifications) {
        data.certifications.forEach((cert, index) => {
            const item = document.createElement('a');
            item.href = cert.link;
            item.target = "_blank";
            item.className = 'bento-item reveal';
            item.style.gridColumn = `span 6`;
            item.innerHTML = `
                <span class="bento-id">${cert.issuer} // CREDENTIAL</span>
                <h3 class="bento-title">${cert.name}</h3>
                <p class="bento-desc">ID: ${cert.id}</p>
                <div style="margin-top: 2rem;">
                    <span class="hero-socials" style="font-size: 0.6rem; color: var(--accent);">VERIFY_CREDENTIAL ↗</span>
                </div>
            `;
            certsGrid.appendChild(item);
            observer.observe(item);
        });
    }

    // Dynamic Mobile Navigation Menu Toggle Setup
    const navInner = document.querySelector('.nav-inner');
    if (navInner && themeBtn) {
        // Create a wrapper for controls (theme toggle + menu toggle)
        const controls = document.createElement('div');
        controls.className = 'nav-controls';
        
        // Relocate theme toggle button inside the new container
        themeBtn.parentNode.insertBefore(controls, themeBtn);
        controls.appendChild(themeBtn);
        
        // Create and append the hamburger menu toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'nav-toggle';
        toggleBtn.setAttribute('aria-label', 'Toggle Navigation');
        toggleBtn.innerHTML = `
            <span class="nav-toggle-bar"></span>
            <span class="nav-toggle-bar"></span>
            <span class="nav-toggle-bar"></span>
        `;
        controls.appendChild(toggleBtn);
        
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                navLinks.classList.toggle('nav-links-active');
                toggleBtn.classList.toggle('nav-toggle-active');
            });
            
            // Close the menu when clicking on any nav link
            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('nav-links-active');
                    toggleBtn.classList.remove('nav-toggle-active');
                });
            });

            // Close the menu if clicked outside the navigation bar
            document.addEventListener('click', (e) => {
                if (!navInner.contains(e.target) && navLinks.classList.contains('nav-links-active')) {
                    navLinks.classList.remove('nav-links-active');
                    toggleBtn.classList.remove('nav-toggle-active');
                }
            });
        }
    }
});

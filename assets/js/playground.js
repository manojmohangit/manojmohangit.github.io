(function() {
    // Check if playgrounds exist on the page
    const playgrounds = document.querySelectorAll('.html-playground');
    if (playgrounds.length === 0) return;

    // Load assets dynamically
    const assets = {
        css: [
            'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/codemirror.min.css',
            'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/theme/tomorrow-night-eighties.min.css',
            'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/theme/neo.min.css'
        ],
        js: [
            'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/codemirror.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/mode/xml/xml.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/mode/javascript/javascript.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/mode/css/css.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/mode/htmlmixed/htmlmixed.min.js'
        ]
    };

    let loadedCount = 0;
    const totalScripts = assets.js.length;

    // Load styles
    assets.css.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    });

    // Load scripts sequentially to avoid dependency issues (CodeMirror must load first)
    function loadScripts(index) {
        if (index >= totalScripts) {
            initializePlaygrounds();
            return;
        }
        const script = document.createElement('script');
        script.src = assets.js[index];
        script.onload = () => loadScripts(index + 1);
        document.head.appendChild(script);
    }

    loadScripts(0);

    function initializePlaygrounds() {
        playgrounds.forEach((container, i) => {
            // Find initial source template
            const sourceTemplate = container.querySelector('.playground-source');
            let initialCode = '';
            if (sourceTemplate) {
                if (sourceTemplate.tagName.toLowerCase() === 'textarea') {
                    initialCode = sourceTemplate.value.trim();
                } else {
                    initialCode = sourceTemplate.innerHTML.trim()
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&amp;/g, '&');
                }
            }

            // Clear original template script
            container.innerHTML = '';

            // Construct widget UI
            container.className = 'playground-container';
            
            const editorPane = document.createElement('div');
            editorPane.className = 'playground-editor-pane';

            const header = document.createElement('div');
            header.className = 'playground-header';
            header.innerHTML = `
                <span>Source Editor</span>
                <div class="playground-status">
                    <span class="playground-status-dot" id="status-dot-${i}"></span>
                    <span id="status-text-${i}">Live</span>
                </div>
            `;
            editorPane.appendChild(header);

            const codeWrapper = document.createElement('div');
            codeWrapper.className = 'playground-code-editor';
            editorPane.appendChild(codeWrapper);

            const previewPane = document.createElement('div');
            previewPane.className = 'playground-preview-pane';

            const editToggleBtn = document.createElement('button');
            editToggleBtn.className = 'playground-toggle-btn';
            editToggleBtn.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
                <span>Edit Code</span>
            `;
            previewPane.appendChild(editToggleBtn);

            const iframe = document.createElement('iframe');
            iframe.className = 'playground-iframe';
            iframe.sandbox = 'allow-scripts';
            previewPane.appendChild(iframe);

            container.appendChild(editorPane);
            container.appendChild(previewPane);

            // Initialize CodeMirror
            const isDarkMode = document.documentElement.getAttribute('data-theme') !== 'light';
            const editor = CodeMirror(codeWrapper, {
                value: initialCode,
                mode: 'htmlmixed',
                theme: isDarkMode ? 'tomorrow-night-eighties' : 'neo',
                lineNumbers: true,
                lineWrapping: true,
                tabSize: 2
            });

            // Handle theme changes
            const themeObserver = new MutationObserver(() => {
                const currentDark = document.documentElement.getAttribute('data-theme') !== 'light';
                editor.setOption('theme', currentDark ? 'tomorrow-night-eighties' : 'neo');
            });
            themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

            // Toggle functionality
            editToggleBtn.addEventListener('click', () => {
                const isEditing = container.classList.toggle('is-editing');
                if (isEditing) {
                    editToggleBtn.innerHTML = `
                        <svg viewBox="0 0 24 24">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                        <span>Close Editor</span>
                    `;
                    setTimeout(() => editor.refresh(), 100);
                } else {
                    editToggleBtn.innerHTML = `
                        <svg viewBox="0 0 24 24">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                        <span>Edit Code</span>
                    `;
                }
            });

            // Live Update Logic with Debounce
            let debounceTimeout;
            const statusDot = document.getElementById(`status-dot-${i}`);
            const statusText = document.getElementById(`status-text-${i}`);

            function updatePreview() {
                statusDot.classList.add('compiling');
                statusText.textContent = 'Updating...';

                clearTimeout(debounceTimeout);
                debounceTimeout = setTimeout(() => {
                    const code = editor.getValue();
                    iframe.srcdoc = code;

                    statusDot.classList.remove('compiling');
                    statusText.textContent = 'Live';
                }, 400);
            }

            editor.on('change', updatePreview);
            updatePreview(); // Initial load
        });
    }
})();

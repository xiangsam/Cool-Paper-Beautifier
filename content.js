function applyModernStyle() {
    // Add a class to body to scope styles and avoid conflicts
    document.body.classList.add('transformed-body');

    // Inject Font Awesome
    const fontAwesomeLink = document.createElement('link');
    fontAwesomeLink.rel = 'stylesheet';
    fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css';
    document.head.appendChild(fontAwesomeLink);
    
    // Inject Google Font 'Roboto'
    const robotoFontLink = document.createElement('link');
    robotoFontLink.rel = 'stylesheet';
    robotoFontLink.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap';
    document.head.appendChild(robotoFontLink);

    // Create main container for transformed content
    const transformedContainer = document.createElement('div');
    transformedContainer.className = 'transformed-container';
    document.body.appendChild(transformedContainer);

    // Create and inject progress bar
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.id = 'transformed-progress-bar';
    progressContainer.appendChild(progressBar);
    document.body.insertBefore(progressContainer, document.body.firstChild);

    // Dark Mode Toggle Button
    const darkModeToggle = document.createElement('button');
    darkModeToggle.id = 'dark-mode-toggle';
    darkModeToggle.className = 'dark-mode-toggle';
    darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    document.body.appendChild(darkModeToggle);

    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        darkModeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });

    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }


    // Transform Header
    const originalHeaderTitleEl = document.querySelector('body > h1.notranslate');
    const originalHeaderInfoEl = document.querySelector('body > p.info.notranslate');
    const newHeader = document.createElement('div');
    newHeader.className = 'transformed-header';
    if (originalHeaderTitleEl) {
        const newTitle = document.createElement('h1');
        newTitle.textContent = originalHeaderTitleEl.textContent;
        newHeader.appendChild(newTitle);
    }
    const subTitle = document.createElement('p');
    subTitle.className = 'subtitle';
    subTitle.textContent = 'Your daily dose of the latest research papers, curated just for you.';
    newHeader.appendChild(subTitle);
    if (originalHeaderInfoEl) {
        const infoControls = document.createElement('div');
        infoControls.className = 'info-controls';
        const dateLink = originalHeaderInfoEl.querySelector('a.date');
        if (dateLink) {
            const dateDisplay = document.createElement('span');
            dateDisplay.className = 'date-display';
            dateDisplay.textContent = dateLink.textContent;
            infoControls.appendChild(dateDisplay);
            infoControls.appendChild(document.createTextNode(" | "));
        }
        originalHeaderInfoEl.querySelectorAll('.shortcut, .feed-it').forEach(sc => {
            const newSc = document.createElement('span');
            newSc.className = sc.className.includes('feed-it') ? 'feed-it' : 'shortcut';
            newSc.title = sc.title;
            newSc.innerHTML = sc.innerHTML;
            if (sc.getAttribute('onclick')) {
                 newSc.setAttribute('onclick', sc.getAttribute('onclick'));
            }
            infoControls.appendChild(newSc);
        });
        const totalTextMatch = originalHeaderInfoEl.textContent.match(/Total: \d+/);
        if (totalTextMatch) {
            infoControls.appendChild(document.createTextNode(" | "));
            const totalSpan = document.createElement('span');
            totalSpan.className = 'total-papers';
            totalSpan.textContent = totalTextMatch[0];
            infoControls.appendChild(totalSpan);
        }
        newHeader.appendChild(infoControls);
    }
    transformedContainer.appendChild(newHeader);

    // Transform Papers
    const originalPapersContainer = document.querySelector('body > div.papers');
    const newPapersContainer = document.createElement('div');
    newPapersContainer.id = 'transformed-papers-container';

    if (originalPapersContainer) {
        const papers = originalPapersContainer.querySelectorAll('.panel.paper');
        papers.forEach((paper, index) => {
            const paperId = paper.id;
            const escapedPaperIdForQuery = paperId.replace(/([\.@])/g, '\\$1');

            const titleHeaderEl = paper.querySelector('h2.title');
            let paperIndexStr = "";
            if (titleHeaderEl) {
                const indexSpan = titleHeaderEl.querySelector('span.index.notranslate');
                if (indexSpan) {
                    paperIndexStr = indexSpan.textContent.trim() + " ";
                }
            }

            const titleLinkEl = paper.querySelector(`a#title-${escapedPaperIdForQuery}.title-link`);
            const titleText = titleLinkEl ? titleLinkEl.textContent.trim() : 'N/A';
            const coolPaperInternalLink = titleLinkEl ? titleLinkEl.href : '#';

            let externalSourceLink = null;
            const arxivAbsLinkEl = paper.querySelector(`h2.title > a[href*="arxiv.org/abs/"]`);
            const venueLinkEl = paper.querySelector(`h2.title > a:not([href*="arxiv.org/abs/"]):not([href*="papers.cool/arxiv/"])`);

            if (arxivAbsLinkEl) {
                externalSourceLink = arxivAbsLinkEl.href;
            } else if (venueLinkEl && venueLinkEl.href && !venueLinkEl.href.includes('papers.cool/venue/')) {
                externalSourceLink = venueLinkEl.href;
            } else if (titleLinkEl && titleLinkEl.href.startsWith('http') && !titleLinkEl.href.includes('papers.cool')) {
                 externalSourceLink = titleLinkEl.href;
            }

            const authors = Array.from(paper.querySelectorAll(`#authors-${escapedPaperIdForQuery} a.author`)).map(a => ({
                name: a.textContent.trim(),
                href: a.href
            }));

            const summaryEl = paper.querySelector(`#summary-${escapedPaperIdForQuery}.summary`);
            let summaryText = summaryEl ? summaryEl.textContent.trim() : 'N/A';
            const mathJaxLinkRegex = /More details will be updated at <span class="MathJax_Preview">.*?<\/script>\./s;
            summaryText = summaryText.replace(mathJaxLinkRegex, 'More details will be updated.').replace(/\s\s+/g, ' ');

            const subjects = Array.from(paper.querySelectorAll(`#subjects-${escapedPaperIdForQuery} a[class^="subject-"]`)).map(s => {
                return {
                    text: s.textContent.trim(),
                    href: s.href ? new URL(s.href, window.location.origin).href : '#'
                };
            });

            const dateEl = paper.querySelector(`#date-${escapedPaperIdForQuery}.metainfo.date`);
            const publishDateText = dateEl ? dateEl.textContent.replace('Publish:', '').trim() : 'Venue Paper';

            // PDF Interactions & Link Logic
            const pdfLinkOriginalEl = paper.querySelector(`#pdf-${escapedPaperIdForQuery}.title-pdf`);
            let pdfInteractions = '0';
            let pdfActionUrl = '#';

            if (pdfLinkOriginalEl) {
                const onclickAttr = pdfLinkOriginalEl.getAttribute('onclick');
                let originalPdfUrlArg = '';

                if (onclickAttr) {
                    const onclickArgsMatch = onclickAttr.match(/togglePdf\s*\(\s*['"][^'"]+['"]\s*,\s*['"]([^'"]+)['"]/);
                    if (onclickArgsMatch && onclickArgsMatch[1]) {
                        originalPdfUrlArg = onclickArgsMatch[1];
                    }
                }

                if (externalSourceLink && externalSourceLink.includes("arxiv.org/abs/")) {
                     pdfActionUrl = externalSourceLink.replace('/abs/', '/pdf/');
                }
                else if (originalPdfUrlArg && originalPdfUrlArg.startsWith('http') && originalPdfUrlArg.toLowerCase().endsWith('.pdf')) {
                    pdfActionUrl = originalPdfUrlArg;
                }
                else if (originalPdfUrlArg && originalPdfUrlArg.startsWith('/pdf?url=')) {
                    pdfActionUrl = `/static/pdf.js/web/viewer.html?file=${encodeURIComponent(originalPdfUrlArg)}`;
                }
                else if (externalSourceLink) {
                    if (externalSourceLink.includes("aclanthology.org") &&
                        externalSourceLink.match(/\/\d{4}\.[a-zA-Z]+-[\w\.]+\.\d+\/?$/)) {
                        pdfActionUrl = externalSourceLink.endsWith('/') ? externalSourceLink + "pdf" : externalSourceLink + ".pdf";
                    }
                    else if (externalSourceLink.includes("ojs.aaai.org/index.php/AAAI/article/view/")) {
                        const viewMatch = externalSourceLink.match(/view\/(\d+)/);
                        if (viewMatch && viewMatch[1]) {
                           const downloadIdMatch = externalSourceLink.match(/view\/\d+\/(\d+)/);
                           const downloadId = downloadIdMatch ? downloadIdMatch[1] : viewMatch[1];
                           pdfActionUrl = externalSourceLink.replace(/view\/\d+(\/\d+)?/, `download/${viewMatch[1]}/${downloadId}`);
                        } else {
                           pdfActionUrl = originalPdfUrlArg || externalSourceLink || '#';
                        }
                    }
                    else {
                        pdfActionUrl = originalPdfUrlArg || externalSourceLink || '#';
                    }
                }
                else {
                    pdfActionUrl = originalPdfUrlArg || '#';
                }

                const supEl = pdfLinkOriginalEl.querySelector('sup');
                if (supEl) {
                    const interactionsText = supEl.textContent.trim();
                    pdfInteractions = interactionsText === "" ? '0' : interactionsText;
                }
            }

            // Kimi Interactions
            const kimiLinkOriginalEl = paper.querySelector(`#kimi-${escapedPaperIdForQuery}.title-kimi`);
            let kimiInteractions = '0';
            if (kimiLinkOriginalEl) {
                const supEl = kimiLinkOriginalEl.querySelector('sup');
                if (supEl) {
                    const interactionsText = supEl.textContent.trim();
                    kimiInteractions = interactionsText === "" ? '0' : interactionsText;
                }
            }

            const kimiContextLink = externalSourceLink || coolPaperInternalLink;

            const paperBlock = document.createElement('div');
            paperBlock.className = 'paper-block';

            let authorsHTML = authors.map(author => `<a href="${author.href}" target="_blank" class="author-item">${author.name}</a>`).join('');
            let subjectsHTML = subjects.map(s => `<a href="${s.href}" target="_blank" class="subject-item">${s.text}</a>`).join(' ');

            const displayTitle = paperIndexStr + titleText;

            let titleHTML;
            const arxivIdRegex = /^\d{4}\.\d{4,5}(v\d+)?$/;
            const isStrictNumericArxivId = arxivIdRegex.test(paperId);
            let isArxivPaperForTitleLink = false;

            if (externalSourceLink && externalSourceLink.includes('arxiv.org/abs/')) {
                isArxivPaperForTitleLink = true;
            } else if (isStrictNumericArxivId && !paperId.includes('@')) {
                isArxivPaperForTitleLink = true;
            }

            if (isArxivPaperForTitleLink) {
                let arxivAbsLink = externalSourceLink;
                if (!arxivAbsLink || !arxivAbsLink.includes('arxiv.org/abs/')) {
                    arxivAbsLink = `https://arxiv.org/abs/${paperId}`;
                }
                titleHTML = `<a href="${arxivAbsLink}" target="_blank">${displayTitle}</a>`;
            } else {
                titleHTML = `<span>${displayTitle}</span>`;
            }

            paperBlock.innerHTML = `
                <div class="paper-title">${titleHTML}</div>
                <div class="paper-meta-grid">
                    <div class="paper-authors"><strong>Authors:</strong> <span class="author-list">${authorsHTML}</span></div>
                    <div class="paper-subjects"><strong>Subjects:</strong> ${subjectsHTML}</div>
                    <div class="paper-date"><strong>Publish Date:</strong> ${publishDateText}</div>
                    <div class="paper-id"><strong>ID:</strong> ${paperId}</div>
                    <div class="paper-interactions">
                        <strong>Interactions:</strong>
                        PDF Views: ${pdfInteractions} | Kimi Reads: ${kimiInteractions}
                    </div>
                </div>
                <div class="paper-abstract"><strong>Abstract:</strong> ${summaryText}</div>
                <div class="paper-actions">
                    <a href="${pdfActionUrl}" target="_blank" class="pdf-btn"><i class="fas fa-file-pdf"></i> PDF</a>
                    <button class="kimi-btn" data-paper-id="${paperId}" data-kimi-loaded="false"><i class="fas fa-robot"></i> Show Kimi Analysis</button>
                    <button class="copy-btn" data-paper-id="${paperId}"><i class="fas fa-copy"></i> Copy Info</button>
                    <button class="rel-btn" data-paper-id="${paperId}"><i class="fas fa-link"></i> Related</button>
                </div>
                <div class="transformed-kimi-content" id="transformed-kimi-container-${paperId}" style="display: none;">
                    </div>
            `;
            newPapersContainer.appendChild(paperBlock);
            setTimeout(() => paperBlock.classList.add('visible'), index * 50);
        });
        transformedContainer.appendChild(newPapersContainer);

        newPapersContainer.querySelectorAll('.kimi-btn').forEach(button => {
            button.addEventListener('click', async () => {
                const currentPaperId = button.dataset.paperId;
                const transformedKimiContainer = document.getElementById(`transformed-kimi-container-${currentPaperId}`);
                const originalKimiButton = document.getElementById(`kimi-${currentPaperId}`);
                const originalKimiDisplayContainer = document.getElementById(`kimi-container-${currentPaperId}`);

                if (!transformedKimiContainer) {
                    console.error("Transformed Kimi container not found for paper:", currentPaperId);
                    alert("Could not process Kimi request for this paper (UI element missing).");
                    return;
                }

                let effectiveOriginalKimiButton = originalKimiButton;
                let effectiveOriginalKimiDisplayContainer = originalKimiDisplayContainer;

                if (!effectiveOriginalKimiButton) {
                    const paperElement = document.getElementById(currentPaperId);
                    if (paperElement) {
                        effectiveOriginalKimiButton = paperElement.querySelector('.title-kimi');
                    }
                }
                if (!effectiveOriginalKimiDisplayContainer) {
                     const paperElement = document.getElementById(currentPaperId);
                     if (paperElement) {
                        effectiveOriginalKimiDisplayContainer = paperElement.querySelector('.kimi-container');
                     }
                }

                const isKimiVisible = transformedKimiContainer.style.display !== 'none';

                if (isKimiVisible) {
                    transformedKimiContainer.style.display = 'none';
                    button.innerHTML = `<i class="fas fa-robot"></i> Show Kimi Analysis`;
                } else {
                    if (button.dataset.kimiLoaded === 'true' && transformedKimiContainer.innerHTML.trim() !== '') {
                        transformedKimiContainer.style.display = 'block';
                        button.innerHTML = `<i class="fas fa-robot"></i> Hide Kimi Analysis`;
                    } else {
                        button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Loading Kimi...`;
                        button.disabled = true;
                        transformedKimiContainer.innerHTML = '<p>Fetching Kimi analysis...</p>';
                        transformedKimiContainer.style.display = 'block';

                        if (effectiveOriginalKimiButton && effectiveOriginalKimiButton.dataset.clickable !== 'false') {
                            if (typeof window.toggleKimi === 'function') {
                                window.toggleKimi(currentPaperId, effectiveOriginalKimiButton);
                            }
                        }

                        let pollAttempts = 0;
                        const maxPollAttempts = 20;
                        const pollInterval = 2000;

                        const pollForKimiContent = () => {
                            pollAttempts++;
                            const originalButtonText = effectiveOriginalKimiButton ? (effectiveOriginalKimiButton.textContent || "") : "";
                            const isOriginalLoading = originalButtonText.includes("Loading") || originalButtonText.includes("Pending") || originalButtonText.includes("Generating");
                            const originalHasError = effectiveOriginalKimiDisplayContainer ? (effectiveOriginalKimiDisplayContainer.textContent || "").includes("Kimi出错了，请重试") : false;

                            if (originalHasError) {
                                transformedKimiContainer.innerHTML = '<p><strong style="color:red">Kimi experienced an error (detected from original page). Please try again later.</strong></p>';
                                button.innerHTML = `<i class="fas fa-robot"></i> Show Kimi Analysis (Error)`;
                                button.dataset.kimiLoaded = 'false';
                                button.disabled = false;
                                if (effectiveOriginalKimiButton) effectiveOriginalKimiButton.dataset.clickable = 'true';
                                return;
                            }

                            if (!isOriginalLoading || pollAttempts > 5 || !effectiveOriginalKimiButton) {
                                let bodyId = document.body.id;
                                if (!bodyId) {
                                   if (window.location.pathname.includes('/arxiv/')) bodyId = 'arxiv';
                                   else if (window.location.pathname.includes('/venue/')) bodyId = 'venue';
                                }

                                if (!bodyId) {
                                   console.error("Could not determine bodyId for Kimi request.");
                                   transformedKimiContainer.innerHTML = '<p>Error: Could not determine page context for Kimi.</p>';
                                   button.innerHTML = `<i class="fas fa-robot"></i> Show Kimi Analysis (Error)`;
                                   button.disabled = false;
                                   return;
                                }

                                const xhrFetchKimi = new XMLHttpRequest();
                                xhrFetchKimi.open('POST', `/${bodyId}/kimi?paper=${currentPaperId}`, true);

                                xhrFetchKimi.onload = function() {
                                    if (xhrFetchKimi.status >= 200 && xhrFetchKimi.status < 300) {
                                        let rawContent = xhrFetchKimi.responseText;

                                        if (typeof marked === 'function') {
                                            try {
                                                transformedKimiContainer.innerHTML = marked.parse(rawContent);
                                            } catch (e) {
                                                console.error("Error parsing Markdown with injected marked.js:", e);
                                                transformedKimiContainer.textContent = rawContent;
                                            }
                                        } else if (typeof window.marked === 'function') {
                                            try {
                                                transformedKimiContainer.innerHTML = window.marked.parse(rawContent);
                                            } catch (e) {
                                                console.error("Error parsing Markdown with window.marked:", e);
                                                transformedKimiContainer.textContent = rawContent;
                                            }
                                        } else {
                                            if (rawContent.trim().startsWith("<") && rawContent.trim().endsWith(">")) {
                                                transformedKimiContainer.innerHTML = rawContent;
                                            } else {
                                                const pre = document.createElement('pre');
                                                pre.style.whiteSpace = 'pre-wrap';
                                                pre.textContent = rawContent;
                                                transformedKimiContainer.innerHTML = '';
                                                transformedKimiContainer.appendChild(pre);
                                            }
                                        }

                                        if (typeof window.MathJax !== 'undefined' && window.MathJax.Hub && window.MathJax.Hub.Queue) {
                                           window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, transformedKimiContainer]);
                                        }

                                        transformedKimiContainer.style.display = 'block';
                                        button.innerHTML = `<i class="fas fa-robot"></i> Hide Kimi Analysis`;
                                        button.dataset.kimiLoaded = 'true';
                                    } else {
                                        transformedKimiContainer.innerHTML = `<p>Error fetching Kimi content. Status: ${xhrFetchKimi.status}</p>`;
                                        button.innerHTML = `<i class="fas fa-robot"></i> Show Kimi Analysis (Fetch Error)`;
                                        button.dataset.kimiLoaded = 'false';
                                    }
                                    button.disabled = false;
                                    if (effectiveOriginalKimiButton) effectiveOriginalKimiButton.dataset.clickable = 'true';
                                };
                                xhrFetchKimi.onerror = function() {
                                    transformedKimiContainer.innerHTML = '<p>Network error while fetching Kimi content.</p>';
                                    button.innerHTML = `<i class="fas fa-robot"></i> Show Kimi Analysis (Network Error)`;
                                    button.dataset.kimiLoaded = 'false';
                                    button.disabled = false;
                                    if (effectiveOriginalKimiButton) effectiveOriginalKimiButton.dataset.clickable = 'true';
                                };
                                xhrFetchKimi.send();
                            } else if (pollAttempts < maxPollAttempts) {
                                setTimeout(pollForKimiContent, pollInterval);
                            } else {
                                transformedKimiContainer.innerHTML = '<p>Error: Timed out waiting for Kimi to become ready.</p>';
                                button.innerHTML = `<i class="fas fa-robot"></i> Show Kimi Analysis (Timeout)`;
                                button.dataset.kimiLoaded = 'false';
                                button.disabled = false;
                                if (effectiveOriginalKimiButton) effectiveOriginalKimiButton.dataset.clickable = 'true';
                            }
                        };
                        setTimeout(pollForKimiContent, pollInterval);
                    }
                }
            });
        });

        newPapersContainer.querySelectorAll('.copy-btn').forEach(button => {
            button.addEventListener('click', () => {
                const currentPaperId = button.dataset.paperId;
                const paperBlock = button.closest('.paper-block');
                if (!paperBlock) {
                     alert("Error copying info: Transformed paper data not found."); return;
                }

                const titleEl = paperBlock.querySelector(`.paper-title a, .paper-title span`);
                const title = titleEl ? titleEl.textContent.trim() : "N/A";
                const summary = paperBlock.querySelector(`.paper-abstract`)?.textContent.replace('Abstract:', '').trim() || "N/A";

                let link = "#";
                const originalPaperEl = document.getElementById(currentPaperId);
                if (originalPaperEl) {
                    const arxivLinkEl = originalPaperEl.querySelector(`h2.title > a[href*="arxiv.org/abs/"]`);
                    if (arxivLinkEl) {
                        link = arxivLinkEl.href;
                    } else {
                        const anyExternalTitleLink = originalPaperEl.querySelector(`h2.title > a[href^="http"]:not([href*="papers.cool"])`);
                        if (anyExternalTitleLink) {
                            link = anyExternalTitleLink.href;
                        } else {
                            const escapedIdForTitleQuery = currentPaperId.replace(/([\.@])/g, '\\$1');
                            const coolPaperLinkEl = originalPaperEl.querySelector(`a#title-${escapedIdForTitleQuery}.title-link`);
                            if (coolPaperLinkEl) link = coolPaperLinkEl.href;
                        }
                    }
                }

                navigator.clipboard.writeText(`${title}\nLink: ${link}\nSummary: ${summary.substring(0,250)}...`)
                    .then(() => {
                        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
                        setTimeout(() => button.innerHTML = '<i class="fas fa-copy"></i> Copy Info', 2000);
                    })
                    .catch(err => {
                        console.error('Failed to copy: ', err);
                        alert('Failed to copy info.');
                    });
            });
        });

        newPapersContainer.querySelectorAll('.rel-btn').forEach(button => {
            button.addEventListener('click', () => {
                const currentPaperId = button.dataset.paperId;

                if (typeof window.openRelatedPapers === 'function') {
                    window.openRelatedPapers(currentPaperId);
                } else {
                    const paperElForRelated = document.getElementById(currentPaperId);
                    if (!paperElForRelated) {
                        console.error("Original paper element not found for related action (fallback):", currentPaperId);
                        alert(`Original paper panel for ${currentPaperId} not found.`);
                        return;
                    }
                    const keywords = paperElForRelated.getAttribute('keywords');
                    if (keywords) {
                        window.open('search?query=' + encodeURIComponent(keywords), '_blank');
                    } else {
                        alert(`Keywords for related papers for ${currentPaperId} not found.`);
                    }
                }
            });
        });
    }

    const newFooter = document.createElement('div');
    newFooter.className = 'transformed-footer';
    newFooter.innerHTML = `
        <p>Styled by AI Assistant | Original design inspiration from Cool Paper</p>
        <p>© ${new Date().getFullYear()} Transformed Papers. All rights reserved.</p>
    `;
    transformedContainer.appendChild(newFooter);

    const backToTopButton = document.createElement('a');
    backToTopButton.href = "#";
    backToTopButton.className = 'back-to-top-button';
    backToTopButton.innerHTML = '↑';
    document.body.appendChild(backToTopButton);

    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        const progressBarEl = document.getElementById('transformed-progress-bar');
        if(progressBarEl) progressBarEl.style.width = scrolled + "%";

        if (winScroll > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    backToTopButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const originalBodyElementsToHide = [
        originalHeaderTitleEl,
        originalHeaderInfoEl,
        document.querySelector('body > div.footer.notranslate'),
        document.querySelector('body > div#app-bar'),
        document.querySelector('body > div#scroll-btn')
    ];
    originalBodyElementsToHide.forEach(el => {
        if (el) el.style.display = 'none';
    });
    if(originalPapersContainer) originalPapersContainer.style.display = 'none';
}

if (document.readyState === "complete" || document.readyState === "interactive") {
    applyModernStyle();
} else {
    document.addEventListener("DOMContentLoaded", applyModernStyle);
}
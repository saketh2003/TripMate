
/* =========================================================
   TRIPMATE AI
   Frontend JavaScript
   ========================================================= */


/* =========================================================
   GLOBAL VARIABLES
   ========================================================= */

let currentThreadId =
    localStorage.getItem("travel_thread_id") || null;

let latestAnswerMarkdown = "";

let latestAnswerText = "";


/* =========================================================
   QUICK PROMPTS
   ========================================================= */

function setPrompt(text) {

    const input =
        document.getElementById("userInput");

    if (!input) {
        return;
    }

    input.value = text;

    input.focus();
}


/* =========================================================
   LOADING
   ========================================================= */

function setLoading(isLoading) {

    const sendBtn =
        document.getElementById("sendBtn");

    const btnText =
        document.getElementById("btnText");

    const btnLoader =
        document.getElementById("btnLoader");


    if (!sendBtn) {
        return;
    }


    sendBtn.disabled = isLoading;


    if (btnText) {

        if (isLoading) {
            btnText.classList.add("hidden");
        } else {
            btnText.classList.remove("hidden");
        }
    }


    if (btnLoader) {

        if (isLoading) {
            btnLoader.classList.remove("hidden");
        } else {
            btnLoader.classList.add("hidden");
        }
    }
}


/* =========================================================
   ERROR
   ========================================================= */

function showError(message) {

    const errorBox =
        document.getElementById("errorBox");


    if (!errorBox) {
        alert(message);
        return;
    }


    errorBox.textContent = message;

    errorBox.classList.remove("hidden");
}


function hideError() {

    const errorBox =
        document.getElementById("errorBox");


    if (!errorBox) {
        return;
    }


    errorBox.textContent = "";

    errorBox.classList.add("hidden");
}


/* =========================================================
   MARKDOWN TO PLAIN TEXT
   Used for COPY
   ========================================================= */

function markdownToPlainText(markdown) {

    if (!markdown) {
        return "";
    }


    let text = markdown;


    /* Remove heading symbols */

    text = text.replace(
        /^#{1,6}\s+/gm,
        ""
    );


    /* Remove bold */

    text = text.replace(
        /\*\*(.*?)\*\*/g,
        "$1"
    );


    /* Remove italic */

    text = text.replace(
        /\*(.*?)\*/g,
        "$1"
    );


    /* Remove inline code */

    text = text.replace(
        /`([^`]+)`/g,
        "$1"
    );


    /* Convert Markdown links */

    text = text.replace(
        /\[([^\]]+)\]\([^)]+\)/g,
        "$1"
    );


    /* Convert bullet points */

    text = text.replace(
        /^\s*[-*+]\s+/gm,
        "• "
    );


    /* Clean excessive empty lines */

    text = text.replace(
        /\n{3,}/g,
        "\n\n"
    );


    return text.trim();
}


/* =========================================================
   SHOW RESULT
   ========================================================= */

function showResult(answer, threadId) {

    /* ---------------------------------------------
       Save the ORIGINAL AI answer
       --------------------------------------------- */

    latestAnswerMarkdown = answer;

    latestAnswerText =
        markdownToPlainText(answer);


    /* ---------------------------------------------
       Get elements
       --------------------------------------------- */

    const resultSection =
        document.getElementById("resultSection");

    const resultBox =
        document.getElementById("resultBox");

    const threadInfo =
        document.getElementById("threadInfo");


    if (!resultBox) {

        showError(
            "Result box was not found."
        );

        return;
    }


    /* ---------------------------------------------
       Render Markdown
       --------------------------------------------- */

    if (
        typeof marked !== "undefined" &&
        typeof marked.parse === "function"
    ) {

        resultBox.innerHTML =
            marked.parse(answer);

    } else {

        resultBox.textContent =
            answer;
    }


    /* ---------------------------------------------
       Thread ID
       --------------------------------------------- */

    if (threadInfo) {

        threadInfo.textContent =
            `Thread ID: ${threadId}`;
    }


    /* ---------------------------------------------
       Show result
       --------------------------------------------- */

    if (resultSection) {

        resultSection.classList.remove(
            "hidden"
        );


        setTimeout(() => {

            resultSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 100);
    }
}


/* =========================================================
   SEND MESSAGE
   ========================================================= */

async function sendMessage() {

    hideError();


    const input =
        document.getElementById("userInput");


    if (!input) {

        showError(
            "Travel input box was not found."
        );

        return;
    }


    const message =
        input.value.trim();


    /* ---------------------------------------------
       Validate input
       --------------------------------------------- */

    if (!message) {

        showError(
            "Please enter your travel request first."
        );

        input.focus();

        return;
    }


    setLoading(true);


    try {

        /* =========================================
           YOUR ORIGINAL API
           DO NOT CHANGE
           ========================================= */

        const response =
            await fetch("/api/travel", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    message: message,

                    thread_id: currentThreadId

                })
            });


        /* -----------------------------------------
           Convert response to JSON
           ----------------------------------------- */

        const data =
            await response.json();


        /* -----------------------------------------
           Check API response
           ----------------------------------------- */

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.error ||
                "Something went wrong."
            );
        }


        /* -----------------------------------------
           Save thread ID
           ----------------------------------------- */

        currentThreadId =
            data.thread_id;


        localStorage.setItem(
            "travel_thread_id",
            currentThreadId
        );


        /* -----------------------------------------
           Show answer
           ----------------------------------------- */

        showResult(
            data.answer,
            data.thread_id
        );


    } catch (error) {

        console.error(
            "TripMate API Error:",
            error
        );


        showError(
            error.message ||
            "Unable to connect to TripMate."
        );


    } finally {

        setLoading(false);
    }
}


/* =========================================================
   COPY BUTTON
   ========================================================= */

async function copyResult() {

    hideError();


    /* ---------------------------------------------
       Make sure answer exists
       --------------------------------------------- */

    if (!latestAnswerText) {

        showError(
            "There is no travel plan to copy yet."
        );

        return;
    }


    const copyBtn =
        document.querySelector(".copy-btn");


    const originalText =
        copyBtn
            ? copyBtn.textContent
            : "Copy";


    if (copyBtn) {

        copyBtn.disabled = true;

        copyBtn.textContent =
            "Copying...";
    }


    try {

        /* -----------------------------------------
           Try modern clipboard API
           ----------------------------------------- */

        if (
            navigator.clipboard &&
            window.isSecureContext
        ) {

            await navigator.clipboard.writeText(
                latestAnswerText
            );

        } else {

            /* -------------------------------------
               Fallback for HTTP/local development
               ------------------------------------- */

            const textarea =
                document.createElement("textarea");


            textarea.value =
                latestAnswerText;


            textarea.style.position =
                "fixed";

            textarea.style.left =
                "-9999px";

            textarea.style.top =
                "0";


            document.body.appendChild(
                textarea
            );


            textarea.focus();

            textarea.select();


            const copied =
                document.execCommand("copy");


            textarea.remove();


            if (!copied) {

                throw new Error(
                    "Copy operation failed."
                );
            }
        }


        /* -----------------------------------------
           Success
           ----------------------------------------- */

        if (copyBtn) {

            copyBtn.textContent =
                "✓ Copied!";


            setTimeout(() => {

                copyBtn.textContent =
                    originalText;

                copyBtn.disabled =
                    false;

            }, 1500);
        }


    } catch (error) {

        console.error(
            "Copy Error:",
            error
        );


        if (copyBtn) {

            copyBtn.textContent =
                originalText;

            copyBtn.disabled =
                false;
        }


        showError(
            "Could not copy the travel plan."
        );
    }
}



/* =========================================================
   DOWNLOAD PDF
   ========================================================= */

async function downloadPDF() {

    hideError();


    /* ---------------------------------------------
       Make sure answer exists
       --------------------------------------------- */

    if (!latestAnswerMarkdown) {

        showError(
            "No travel plan available to download."
        );

        return;
    }


    /* ---------------------------------------------
       Check html2pdf library
       --------------------------------------------- */

    if (typeof html2pdf !== "function") {

        showError(
            "PDF library was not loaded. Please refresh the page."
        );

        console.error(
            "html2pdf library is not available."
        );

        return;
    }


    /* ---------------------------------------------
       Get the actual visible result
       --------------------------------------------- */

    const resultBox =
        document.getElementById("resultBox");


    if (!resultBox) {

        showError(
            "Travel plan result could not be found."
        );

        return;
    }


    /* ---------------------------------------------
       Make sure result contains text
       --------------------------------------------- */

    if (!resultBox.innerText.trim()) {

        showError(
            "There is no travel plan content to download."
        );

        return;
    }


    /* ---------------------------------------------
       Download button
       --------------------------------------------- */

    const downloadBtn =
        document.querySelector(".download-btn");


    const originalText =
        downloadBtn
            ? downloadBtn.textContent
            : "📄 Download PDF";


    if (downloadBtn) {

        downloadBtn.disabled = true;

        downloadBtn.textContent =
            "Preparing PDF...";
    }


    let pdf = null;


    try {

        /* =========================================
           CREATE PDF CONTAINER
           ========================================= */

        pdf =
            document.createElement("div");


        pdf.style.position =
            "absolute";

        pdf.style.left =
            "-9000px";

        pdf.style.top =
            "0";

        pdf.style.width =
            "794px";

        pdf.style.padding =
            "45px";

        pdf.style.boxSizing =
            "border-box";

        pdf.style.backgroundColor =
            "#ffffff";

        pdf.style.color =
            "#111827";

        pdf.style.fontFamily =
            "Arial, Helvetica, sans-serif";

        pdf.style.fontSize =
            "14px";

        pdf.style.lineHeight =
            "1.6";


        /* =========================================
           PDF HEADER
           ========================================= */

        const title =
            document.createElement("h1");


        title.textContent =
            "✈️ TripMate AI";


        title.style.margin =
            "0 0 6px 0";

        title.style.fontSize =
            "30px";

        title.style.fontWeight =
            "700";

        title.style.color =
            "#111827";


        pdf.appendChild(title);


        const subtitle =
            document.createElement("p");


        subtitle.textContent =
            "AI-Generated Travel Plan";


        subtitle.style.margin =
            "0 0 25px 0";

        subtitle.style.fontSize =
            "14px";

        subtitle.style.color =
            "#6b7280";


        pdf.appendChild(subtitle);


        /* =========================================
           SEPARATOR
           ========================================= */

        const line =
            document.createElement("hr");


        line.style.border =
            "none";

        line.style.borderTop =
            "1px solid #d1d5db";

        line.style.margin =
            "0 0 25px 0";


        pdf.appendChild(line);


        /* =========================================
           CLONE THE ACTUAL RESULT BOX
           
           IMPORTANT:
           We are NOT parsing the Markdown again.
           
           We copy exactly what is already visible
           on the webpage.
           ========================================= */

        const resultClone =
            resultBox.cloneNode(true);


        resultClone.removeAttribute(
            "id"
        );


        resultClone.style.display =
            "block";

        resultClone.style.visibility =
            "visible";

        resultClone.style.opacity =
            "1";

        resultClone.style.width =
            "100%";

        resultClone.style.height =
            "auto";

        resultClone.style.maxHeight =
            "none";

        resultClone.style.overflow =
            "visible";

        resultClone.style.backgroundColor =
            "#ffffff";

        resultClone.style.color =
            "#111827";


        /* =========================================
           FIX ALL TEXT
           ========================================= */

        resultClone
            .querySelectorAll("*")
            .forEach(
                (element) => {

                    element.style.color =
                        "#111827";

                    element.style.backgroundColor =
                        "transparent";
                }
            );


        /* =========================================
           HEADINGS
           ========================================= */

        resultClone
            .querySelectorAll(
                "h1, h2, h3, h4, h5, h6"
            )
            .forEach(
                (element) => {

                    element.style.color =
                        "#111827";

                    element.style.backgroundColor =
                        "transparent";

                    element.style.marginTop =
                        "20px";

                    element.style.marginBottom =
                        "10px";
                }
            );


        /* =========================================
           PARAGRAPHS
           ========================================= */

        resultClone
            .querySelectorAll("p")
            .forEach(
                (element) => {

                    element.style.color =
                        "#111827";

                    element.style.marginBottom =
                        "10px";
                }
            );


        /* =========================================
           LISTS
           ========================================= */

        resultClone
            .querySelectorAll(
                "ul, ol"
            )
            .forEach(
                (element) => {

                    element.style.color =
                        "#111827";

                    element.style.paddingLeft =
                        "25px";

                    element.style.marginBottom =
                        "12px";
                }
            );


        resultClone
            .querySelectorAll("li")
            .forEach(
                (element) => {

                    element.style.color =
                        "#111827";

                    element.style.marginBottom =
                        "5px";
                }
            );


        /* =========================================
           TABLES
           ========================================= */

        resultClone
            .querySelectorAll("table")
            .forEach(
                (table) => {

                    table.style.width =
                        "100%";

                    table.style.borderCollapse =
                        "collapse";

                    table.style.backgroundColor =
                        "#ffffff";

                    table.style.color =
                        "#111827";

                    table.style.margin =
                        "15px 0";
                }
            );


        resultClone
            .querySelectorAll(
                "th, td"
            )
            .forEach(
                (cell) => {

                    cell.style.color =
                        "#111827";

                    cell.style.backgroundColor =
                        "#ffffff";

                    cell.style.border =
                        "1px solid #d1d5db";

                    cell.style.padding =
                        "8px";

                    cell.style.textAlign =
                        "left";
                }
            );


        /* =========================================
           CODE BLOCKS
           ========================================= */

        resultClone
            .querySelectorAll(
                "pre, code"
            )
            .forEach(
                (element) => {

                    element.style.color =
                        "#111827";

                    element.style.backgroundColor =
                        "#f3f4f6";

                    element.style.whiteSpace =
                        "pre-wrap";

                    element.style.wordBreak =
                        "break-word";
                }
            );


        /* =========================================
           ADD RESULT TO PDF
           ========================================= */

        pdf.appendChild(
            resultClone
        );


        /* =========================================
           ADD PDF CONTAINER TO DOCUMENT
           ========================================= */

        document.body.appendChild(
            pdf
        );


        /* =========================================
           WAIT FOR BROWSER TO RENDER
           ========================================= */

        await new Promise(
            (resolve) => {

                requestAnimationFrame(
                    () => {

                        requestAnimationFrame(
                            resolve
                        );

                    }
                );

            }
        );


        /* =========================================
           PDF OPTIONS
           ========================================= */

        const options = {

            margin: 0.5,

            filename:
                "TripMate-AI-Travel-Plan.pdf",

            image: {

                type: "jpeg",

                quality: 0.98
            },

            html2canvas: {

                scale: 2,

                useCORS: true,

                allowTaint: true,

                backgroundColor:
                    "#ffffff",

                logging: false,

                scrollX: 0,

                scrollY: 0
            },

            jsPDF: {

                unit: "in",

                format: "a4",

                orientation:
                    "portrait"
            },

            pagebreak: {

                mode: [
                    "css",
                    "legacy"
                ]
            }
        };


        /* =========================================
           GENERATE PDF
           ========================================= */

        await html2pdf()
            .set(options)
            .from(pdf)
            .save();


        /* =========================================
           REMOVE TEMPORARY ELEMENT
           ========================================= */

        pdf.remove();

        pdf = null;


        /* =========================================
           SUCCESS
           ========================================= */

        if (downloadBtn) {

            downloadBtn.textContent =
                "✓ Downloaded!";


            setTimeout(
                () => {

                    downloadBtn.textContent =
                        originalText;

                    downloadBtn.disabled =
                        false;

                },
                1500
            );
        }


        console.log(
            "TripMate PDF generated successfully."
        );


    } catch (error) {

        console.error(
            "TripMate PDF Error:",
            error
        );


        /* -----------------------------------------
           Cleanup
           ----------------------------------------- */

        if (pdf) {

            pdf.remove();

            pdf = null;
        }


        if (downloadBtn) {

            downloadBtn.textContent =
                originalText;

            downloadBtn.disabled =
                false;
        }


        showError(
            "Could not create the PDF. Please try again."
        );
    }
}


const processedPosts = new Set();

async function sendToOpenAI(initText, prompt) {
    const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";
    const OPENAI_API_KEY = "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"; 

    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
    };

    const body = {
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: "You are a helpful assistant."
            },
            {
                role: "user",
                content: prompt
            },
            {
                role: "system",
                content: initText
            },
        ]
    };

    try {
        const response = await fetch(OPENAI_ENDPOINT, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const data = await response.json();

        // Assuming you want the assistant's reply:
        const assistantReply = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        return assistantReply;

    } catch (error) {
        console.error("There was a problem with the fetch operation:", error.message);
        return null;
    }
}


function logPosts() {
    // Select all posts
    const posts = document.querySelectorAll('.feed-shared-update-v2__commentary');

    posts.forEach(post => {
        const text = post.textContent.trim();

        // Only log and add to the set if not processed
        if (text && !processedPosts.has(text)) {
            // Move up three levels from the post to the great-grandparent
            let ancestor = post.parentElement && post.parentElement.parentElement
            ? post.parentElement.parentElement.parentElement 
            : null;;

            // If the ancestor exists, find the anchor tag with an aria-label
            let headerInfo = "";
            if (ancestor) {
                const anchorWithLabel = ancestor.querySelector('a[aria-label]');
                if (anchorWithLabel) {
                    headerInfo = anchorWithLabel.getAttribute('aria-label');
                }
            }

            if (text.length > 5){
                (async () => {
                    const prompt = "Here's a social media post:" +
                    "\n========== Header info\n" +
                    headerInfo +
                    "\n========== Content: \n" +
                    text +
                    "\n==========\n" +

                    "\n\n For each one of the following properties, tell me if it is true for the post:" +
                    "\n - It's content is not empty " +
                    "\n - It's a self-improvement post " +
                    "\n - It's an advice " +
                    "\n - It's a promoted post"+
                    "\n - It's a career update " +
                    "\n - It's about someone being at an event " +
                    "\n - It's a fund raise / accelerator admission announcement" +
                    "\n - It's about Stanford University" +
                    "\n\n Only respond with a json file, with properties as keys and false/true as values."
                    
                    initText = "{\n\"It's content is not empty\": true,\n"

                    let result = await sendToOpenAI(initText, prompt);
                    result = "{\n" + result
                    
                    let someTrue = false;
                    try {
                        let jsonObject = JSON.parse(result);
                        console.log(jsonObject);
                        someTrue = Object.values(jsonObject).some(value => value === true);
                    } catch (error) {
                        console.error("Error parsing JSON", error);
                    }

                    if (someTrue){
                        console.log('Gone...');
                        const smileyContainer = document.createElement('div');
                        smileyContainer.innerHTML = '&#128578;'; // Unicode for a smiley face
                        smileyContainer.style.fontSize = '24px'; // You can adjust the style as you wish
                        smileyContainer.style.textAlign = 'center';
        
                        // Replace the post with the smiley container
                        const grandParent = post.parentElement.parentElement.parentElement;
                        
                        // Style the grandparent for centering
                        grandParent.style.display = 'flex';
                        grandParent.style.justifyContent = 'center';
                        grandParent.style.alignItems = 'center';
                        grandParent.style.height = '100%';  // This assumes that the grandparent originally has some defined height.

                        // Add the styled smiley
                        grandParent.innerHTML = '<span style="font-size: 50px; padding: 20px;">😊</span>';
                    }
                    else {
                        console.log(text + " \n::\n::\n " + result);
                    }
                })();
            }
            processedPosts.add(text);

        }
    });
}


function observeFeed() {
    // Select the feed or an element that wraps around all the posts.
    // For this example, I'm using the body, but you should use a more specific container if possible.
    const feed = document.body;

    // Create an observer instance
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            // If new nodes are added
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                logPosts();
            }
        });
    });

    // Configuration for the observer:
    const config = {childList: true, subtree: true };

    // Pass in the target node and the observer options
    observer.observe(feed, config);
}


logPosts();        // Log existing posts
observeFeed();     // Start observing for new posts


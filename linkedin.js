const processedPosts = new Set();

async function sendToOpenAI(initText, prompt, api_key) {
    const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";

    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${api_key}`
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


function logPosts(filters, api_key) {
    // Select all posts
    const posts = document.querySelectorAll('.feed-shared-update-v2:not([data-processed])');

    posts.forEach(post => {
        const text = post.textContent.trim();
        // if text is null or shorter than 7 characters, skip
        if (!text || text.length < 7) { return; }
        
        
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
        (async () => {
            let prompt = "Here's a social media post:" +
            "\n========== Header info\n" +
            headerInfo +
            "\n========== Content: \n" +
            text +
            "\n==========\n" +

            "\n\n For each one of the following properties, tell me if it is true for the post:" +
            "\n - It's content is not empty "

            for (let i = 0; i < filters.length; i++) {
                prompt += "\n - " + filters[i];
            }
        
            "\n\n Only respond with a json file, with properties as keys and false/true as values."
            
            initText = "{\n\"It's content is not empty\": true,\n"

            let result = await sendToOpenAI(initText, prompt, api_key);

            // trim the spaces at the end and beginning
            result = result.trim();

            result = "{\n" + result

            // add a } at the end if it doesn't exist
            if (result[result.length - 1] !== '}') {
                // remove the last comma if it exists
                if (result[result.length - 1] === ',') {
                    result = result.slice(0, -1);
                }

                result += "\n}";
            }


            

            
            let someTrue = false;
            
            try {
                let jsonObject = JSON.parse(result);
                someTrue = Object.values(jsonObject).some(value => value === true);
            } catch (error) {
                console.error("Error parsing JSON", error);
                console.error("Error result\n", result);
                console.error("Error prompt\n", prompt);
            }
            
            // console.log('-------------\n' + prompt + " \n::\n::\n " + result + "\n::\n::\n " + someTrue + '\n-------------\n');
            if (someTrue){
                const smileyContainer = document.createElement('span');
                // add a few empy lines as the innerHTML
                smileyContainer.innerHTML = "<br>";
                smileyContainer.style.fontSize = '50px'; // You can adjust the style as you wish
                smileyContainer.style.padding = '20px';

                const grandParent = post.parentElement.parentElement.parentElement;
                
                // Style the grandparent for centering
                grandParent.style.display = 'flex';
                grandParent.style.justifyContent = 'center';
                grandParent.style.alignItems = 'center';
                grandParent.style.height = '100%';  // This assumes that the grandparent originally has some defined height.
                
                grandParent.innerHTML = ''; // Clear the grandparent
                grandParent.appendChild(smileyContainer);

            }
        })();
            
        post.setAttribute('data-processed', 'true');
    });
}


function observeFeed(filters) {
    // Select the feed or an element that wraps around all the posts.
    // For this example, I'm using the body, but you should use a more specific container if possible.
    const feed = document.body;

    // Create an observer instance
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            // If new nodes are added
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                logPosts(filters, api_key);
            }
        });
    });

    // Configuration for the observer:
    const config = {childList: true, subtree: true };

    // Pass in the target node and the observer options
    observer.observe(feed, config);
}


chrome.storage.sync.get(null, function(data) {
    let filters = [];
    for (let key in data.linkedin) {
        if (data.linkedin[key].state === "Off")
            continue;
        filters.push(data.linkedin[key].value);
    }
    console.log(filters);
    if (filters.length === 0) {
        return;
    }
    api_key = data.openai_api_key;
    console.log(data);
    observeFeed(filters, api_key);     // Start observing for new posts
});


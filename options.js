document.addEventListener('DOMContentLoaded', function() {
    // Load stored properties
    loadProperties();

    // Toggle expand/collapse for social sections
    document.querySelectorAll('.social-title').forEach(title => {
        title.addEventListener('click', function() {
            let platform = this.getAttribute('data-toggle');
            display_name = platform.charAt(0).toUpperCase() + platform.slice(1);
            
            let list = document.getElementById(`${platform}-list`);
            let content = document.getElementById(`${platform}-content`);
            if (list.style.display === "none") {
                list.style.display = "block";
                content.style.display = "block";
                title.textContent = `${display_name} ▼`;
            } else {
                list.style.display = "none";
                content.style.display = "none";
                title.textContent = `${display_name} ►`;
            }
        });
    });

    // Add new user property
    document.querySelectorAll('.add-button').forEach(button => {
        button.addEventListener('click', function() {
            let input = this.previousElementSibling;
            let property = input.value.trim();
            let platform = this.closest('.social-section').querySelector('.social-title').getAttribute('data-toggle');
            let list = document.getElementById(`${platform}-list`);

            if (property) {
                addPropertyToList(list, property, true);
                input.value = '';
                saveProperties(platform, list);
            }
        });
    });

});

function addPropertyToList(list, property, isUserItem) {
    let li = document.createElement('li');

    if (isUserItem) {
        li.className = "user-item";
        li.innerHTML = `
            <button class="delete-button">\u2715</button>
            <span>${property}</span>
            <button class="toggle-button" data-state="On"></button>
        `;

        li.querySelector('.delete-button').addEventListener('click', function() {
            this.closest('li').remove();
            let platform = list.closest('.social-section').querySelector('.social-title').getAttribute('data-toggle');
            saveProperties(platform, list);
        });
    } else {
        li.innerHTML = `
            <span>${property}</span>
            <button class="toggle-button" data-state="On"></button>
        `;
    }

    li.querySelector('.toggle-button').addEventListener('click', function() {
        if (this.getAttribute('data-state') === "On") {
            this.setAttribute('data-state', 'Off');
            this.style.backgroundColor = "#676869";  // Gray color for "Off" state
        } else {
            this.setAttribute('data-state', 'On');
            this.style.backgroundColor = "#0077b6";  // Blue color for "On" state
        }
        let platform = list.closest('.social-section').querySelector('.social-title').getAttribute('data-toggle');
        saveProperties(platform, list);
    });
    

    list.appendChild(li);
}


function saveProperties(platform, list) {
    let properties = Array.from(list.children).map(li => {
        return {
            value: li.querySelector('span').textContent,
            isUserItem: li.classList.contains('user-item'),
            state: li.querySelector('.toggle-button').getAttribute('data-state')
        };
    });

    chrome.storage.sync.set({ [platform]: properties }, function() {
        console.log(`Saved properties for ${platform}`);
    });
}

function loadProperties() {
    chrome.storage.sync.get(null, function(items) {
        console.log(items);
        for (let platform in items) {
            let list = document.getElementById(`${platform}-list`);
            if (list == null){
                continue;
            }
            console.log(list);
            items[platform].forEach(propertyObj => {
                addPropertyToList(list, propertyObj.value, propertyObj.isUserItem);

                let li = list.lastElementChild;
                let toggleBtn = li.querySelector('.toggle-button');
                if (propertyObj.state === 'Off') {
                    toggleBtn.textContent = "";
                    toggleBtn.style.backgroundColor = "#676869";
                } else {
                    toggleBtn.textContent = "";
                    toggleBtn.style.backgroundColor = "#0077b6";
                }
                toggleBtn.setAttribute('data-state', propertyObj.state);
            });
        }
    });
}


document.getElementById('reset-btn').addEventListener('click', function() {
    // Define the default properties for each platform
    const defaultProperties = {
        'linkedin': [
            { value: 'It\'s an announcement ', isUserItem: false, state: 'Off' },
            { value: 'It\'s a self-improvement post (time-management, productivity hacks, how to socialize, etc.) ', isUserItem: false, state: 'Off' },
            { value: 'It\'s a career update (new job or promotion, job anniversary, resignation or retirement, etc.) ', isUserItem: false, state: 'Off' },
            { value: 'It\'s a news article ', isUserItem: false, state: 'Off' },
            { value: 'It\'s header mentions that it\'s a promoted post', isUserItem: false, state: 'Off' },
            { value: 'It\'s a job posting ', isUserItem: false, state: 'Off' },
            { value: 'It\'s a flyer for networking or an events (hackathon, mixer, dinner, meetup, etc. ) ', isUserItem: false, state: 'Off' },
            { value: 'It\'s a scientific or research update (new paper, research findings, tech breakthrough, etc. ) ', isUserItem: false, state: 'Off' },
            { value: 'It\'s a book recommendation or review ', isUserItem: false, state: 'Off' },
            { value: 'It\'s a flyer for a professional development program (webinar, online course, degree program) ', isUserItem: false, state: 'Off' },
            { value: 'It\'s a celebration post (winning an award or achieving something) ', isUserItem: false, state: 'Off' },
            
            // ... Add other LinkedIn defaults here
        ],
        'twitter': [
            { value: 'It\'s Joke or humor tweet', isUserItem: false, state: 'On' }
            // ... Add other Twitter defaults here
        ]
        // ... Add defaults for other platforms
    };

    // Reset options in the UI
    for (let platform in defaultProperties) {
        let list = document.getElementById(`${platform}-list`);
        
        // Clear current items
        while (list.firstChild) {
            list.removeChild(list.lastChild);
        }
        
        // Add default properties
        defaultProperties[platform].forEach(propertyObj => {
            addPropertyToList(list, propertyObj.value, propertyObj.isUserItem);
            
            let li = list.lastElementChild;
            if (propertyObj.state === 'Off') {
                let toggleBtn = li.querySelector('.toggle-button');
                toggleBtn.textContent = "";
                toggleBtn.style.backgroundColor = "#676869";
                toggleBtn.setAttribute('data-state', 'Off');
            }
        });
    }

    // Save defaults to storage
    chrome.storage.sync.set(defaultProperties, function() {
        console.log('Restored default properties.');
    });
});

document.addEventListener("DOMContentLoaded", function() {
    // Load the saved API key when the page is loaded
    loadAPIKey();

    // Save the API key when the 'Save' button is clicked
    document.getElementById("api-key-save-btn").addEventListener("click", function() {
        saveAPIKey();
    });
    
    // The rest of your JS event listeners and functions go here...
});

function loadAPIKey() {
    chrome.storage.sync.get("openai_api_key", function(data) {
        if (data.openai_api_key) {
            document.getElementById("api-key-input").value = data.openai_api_key;
        }
    });
}

function saveAPIKey() {
    let apiKey = document.getElementById("api-key-input").value;
    if (apiKey) {
        chrome.storage.sync.set({ "openai_api_key": apiKey }, function() {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
            } else {
                alert("API Key saved successfully!");
            }
        });
    } else {
        alert("Please enter an API Key before saving.");
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Load stored properties
    loadProperties();

    // Toggle expand/collapse for social sections
    document.querySelectorAll('.social-title').forEach(title => {
        title.addEventListener('click', function() {
            let platform = this.getAttribute('data-toggle');
            let list = document.getElementById(`${platform}-list`);
            
            if (list.style.display === "none") {
                list.style.display = "block";
                title.textContent = `${platform} ▼`;
            } else {
                list.style.display = "none";
                title.textContent = `${platform} ►`;
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
            <span>${property}</span>
            <button class="toggle-button">On</button>
            <button class="delete-button">Delete</button>
        `;

        li.querySelector('.delete-button').addEventListener('click', function() {
            this.closest('li').remove();
            let platform = list.closest('.social-section').querySelector('.social-title').getAttribute('data-toggle');
            saveProperties(platform, list);
        });
    } else {
        li.innerHTML = `
            <span>${property}</span>
            <button class="toggle-button">On</button>
        `;
    }

    li.querySelector('.toggle-button').addEventListener('click', function() {
        if (this.textContent === "On") {
            this.textContent = "Off";
            this.style.backgroundColor = "#e63946";
        } else {
            this.textContent = "On";
            this.style.backgroundColor = "#0077b6";
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
            state: li.querySelector('.toggle-button').textContent
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
                if (propertyObj.state === 'Off') {
                    let toggleBtn = li.querySelector('.toggle-button');
                    toggleBtn.textContent = "Off";
                    toggleBtn.style.backgroundColor = "#e63946";
                }
            });
        }
    });
}


document.getElementById('reset-btn').addEventListener('click', function() {
    // Define the default properties for each platform
    const defaultProperties = {
        'linkedin': [
            { value: 'It\'s an announcement ', isUserItem: false, state: 'On' }
            // ... Add other LinkedIn defaults here
        ],
        'twitter': [
            { value: 'Joke or humor tweet', isUserItem: false, state: 'On' }
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
                toggleBtn.textContent = "Off";
                toggleBtn.style.backgroundColor = "#e63946";
            }
        });
    }

    // Save defaults to storage
    chrome.storage.sync.set(defaultProperties, function() {
        console.log('Restored default properties.');
    });
});

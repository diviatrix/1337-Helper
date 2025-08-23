let allEmojis = [];
let currentEmoji = null;
let searchTimeout;

// Fetch emojis from GitHub emoji API
async function loadEmojis() {
    try {
        // Using OpenMoji API as it's more comprehensive
        const response = await fetch('https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/data/openmoji.json');
        const data = await response.json();
        
        // Filter out extras and problematic emojis
        allEmojis = data.filter(emoji => {
            // Skip if no emoji or empty
            if (!emoji.emoji || !emoji.emoji.trim()) return false;
            // Skip extras category (custom OpenMoji emojis)
            if (emoji.group && emoji.group.toLowerCase().includes('extras')) return false;
            // Skip if emoji is too long (likely a combination or custom)
            if (emoji.emoji.length > 7) return false;
            return true;
        }).map(emoji => {
            // Normalize group names  
            let group = emoji.group || 'Other';
            // Convert to lowercase and standardize
            group = group.toLowerCase();
            
            // Standardize common group names
            if (group.includes('smileys') || group.includes('emotion')) {
                group = 'Smileys & Emotion';
            } else if (group.includes('people') || group.includes('body')) {
                group = 'People & Body';
            } else if (group.includes('animals') || group.includes('nature')) {
                group = 'Animals & Nature';
            } else if (group.includes('food') || group.includes('drink')) {
                group = 'Food & Drink';
            } else if (group.includes('travel') || group.includes('places')) {
                group = 'Travel & Places';
            } else if (group.includes('activities')) {
                group = 'Activities';
            } else if (group.includes('objects')) {
                group = 'Objects';
            } else if (group.includes('symbols')) {
                group = 'Symbols';
            } else if (group.includes('flags')) {
                group = 'Flags';
            } else {
                // Capitalize first letter of each word
                group = group.split(' ').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');
            }
            
            return {
                emoji: emoji.emoji,
                name: emoji.annotation || emoji.openmoji_tags || 'Unknown',
                group: group,
                subgroup: emoji.subgroups || 'Other',
                hexcode: emoji.hexcode
            };
        });

        createCategories();
        // Display only smileys & emotion by default
        const smileys = allEmojis.filter(e => e.group === 'Smileys & Emotion');
        displayEmojis(smileys.length > 0 ? smileys : allEmojis.slice(0, 200));
    } catch (error) {
        console.log('OpenMoji failed, trying fallback...');
        createBasicEmojiSet();
    }
}

function createBasicEmojiSet() {
    // Basic emoji set when APIs fail
    const basicEmojis = [
        { emoji: '🕐', name: 'One Oclock', group: 'Travel & Places' },
        { emoji: '🕑', name: 'Two Oclock', group: 'Travel & Places' },
        { emoji: '🕒', name: 'Three Oclock', group: 'Travel & Places' },
        { emoji: '🕓', name: 'Four Oclock', group: 'Travel & Places' },
        { emoji: '🕔', name: 'Five Oclock', group: 'Travel & Places' },
        { emoji: '🕕', name: 'Six Oclock', group: 'Travel & Places' },
        { emoji: '⏰', name: 'Alarm Clock', group: 'Travel & Places' },
        { emoji: '⏱️', name: 'Stopwatch', group: 'Travel & Places' },
        { emoji: '⏲️', name: 'Timer Clock', group: 'Travel & Places' },
        { emoji: '📱', name: 'Mobile Phone', group: 'Objects' },
        { emoji: '💻', name: 'Laptop', group: 'Objects' },
        { emoji: '🖥️', name: 'Desktop Computer', group: 'Objects' },
        { emoji: '🔧', name: 'Wrench', group: 'Objects' },
        { emoji: '⚙️', name: 'Gear', group: 'Objects' },
        { emoji: '🛠️', name: 'Hammer And Wrench', group: 'Objects' },
        { emoji: '🚀', name: 'Rocket', group: 'Travel & Places' },
        { emoji: '⭐', name: 'Star', group: 'Travel & Places' },
        { emoji: '✨', name: 'Sparkles', group: 'Activities' },
        { emoji: '🎯', name: 'Direct Hit', group: 'Activities' },
        { emoji: '📊', name: 'Bar Chart', group: 'Objects' },
        { emoji: '📈', name: 'Chart Increasing', group: 'Objects' },
        { emoji: '🔥', name: 'Fire', group: 'Travel & Places' },
        { emoji: '💡', name: 'Light Bulb', group: 'Objects' },
        { emoji: '🌟', name: 'Glowing Star', group: 'Travel & Places' }
    ];

    allEmojis = basicEmojis;
    displayEmojis(allEmojis);
    createCategories();
}

function displayEmojis(emojis) {
    const grid = document.getElementById('emojiGrid');
    grid.innerHTML = '';

    emojis.forEach(emoji => {
        const card = document.createElement('div');
        card.className = 'emoji-card';
        card.innerHTML = `
            <span class="emoji-display">${emoji.emoji}</span>
            <div class="emoji-name">${emoji.name}</div>
            <div class="emoji-actions">
                <button class="action-btn" data-action="download" data-emoji="${emoji.emoji}" data-name="${emoji.name}" data-group="${emoji.group || ''}">Download</button>
                <button class="action-btn" data-action="copy" data-emoji="${emoji.emoji}">Copy</button>
            </div>
        `;
        grid.appendChild(card);
    });

    // Add event listeners to all action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', handleActionClick);
    });
}

function handleActionClick(e) {
    const action = e.target.dataset.action;
    const emoji = e.target.dataset.emoji;
    
    if (action === 'download') {
        const name = e.target.dataset.name;
        const group = e.target.dataset.group;
        openModal(emoji, name, group);
    } else if (action === 'copy') {
        copyToClipboard(emoji, e.target);
    }
}

function createCategories() {
    const categories = [...new Set(allEmojis.map(e => e.group))].filter(Boolean).sort();
    const categoriesDiv = document.getElementById('categories');
    
    // Add All button
    categoriesDiv.innerHTML = '';
    const allBtn = document.createElement('button');
    allBtn.className = 'category-btn';
    allBtn.textContent = 'All';
    allBtn.addEventListener('click', () => filterByCategory('all', allBtn));
    categoriesDiv.appendChild(allBtn);
    
    // Add category buttons for each unique category
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        // Mark smileys as active by default
        if (cat.toLowerCase().includes('smileys') || cat.toLowerCase().includes('emotion')) {
            btn.className = 'category-btn active';
        }
        btn.textContent = cat;
        btn.addEventListener('click', () => filterByCategory(cat, btn));
        categoriesDiv.appendChild(btn);
    });
    
    // Log categories for debugging
    console.log(`Total categories: ${categories.length}`, categories);
    console.log(`Total emojis: ${allEmojis.length}`);
}

function filterByCategory(category, btnElement) {
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');

    const filtered = category === 'all' ? allEmojis : allEmojis.filter(e => e.group === category);
    displayEmojis(filtered);
    
    console.log(`Showing ${filtered.length} emojis for category: ${category}`);
}

function searchEmojis(query) {
    const filtered = allEmojis.filter(emoji => 
        emoji.name.toLowerCase().includes(query.toLowerCase()) ||
        emoji.group.toLowerCase().includes(query.toLowerCase())
    );
    displayEmojis(filtered);
}

function openModal(emoji, name, group) {
    currentEmoji = { emoji, name, group };
    document.getElementById('modalEmoji').textContent = emoji;
    document.getElementById('modalName').textContent = name;
    document.getElementById('modalDescription').textContent = `Group: ${group}`;
    
    // Generate download links
    generateDownloadLinks(emoji, name);
    
    document.getElementById('emojiModal').classList.add('visible');
}

function closeModal() {
    document.getElementById('emojiModal').classList.remove('visible');
}

// Function to convert canvas to ICO format
function canvasToIco(canvas, size) {
    // ICO format specification
    // Header: 6 bytes
    // Icon Directory Entry: 16 bytes per image
    // Image data: varies
    
    const header = new ArrayBuffer(6);
    const headerView = new DataView(header);
    headerView.setUint16(0, 0, true); // Reserved
    headerView.setUint16(2, 1, true); // Icon type
    headerView.setUint16(4, 1, true); // Number of images
    
    const entry = new ArrayBuffer(16);
    const entryView = new DataView(entry);
    entryView.setUint8(0, size); // Width
    entryView.setUint8(1, size); // Height
    entryView.setUint8(2, 0); // Color palette
    entryView.setUint8(3, 0); // Reserved
    entryView.setUint16(4, 1, true); // Color planes
    entryView.setUint16(6, 32, true); // Bits per pixel
    entryView.setUint32(8, 0, true); // Image size (will be updated)
    entryView.setUint32(12, 22, true); // Offset to image data
    
    // Convert canvas to PNG data
    const pngDataUrl = canvas.toDataURL('image/png');
    const base64Data = pngDataUrl.split(',')[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Update image size in entry
    entryView.setUint32(8, bytes.length, true);
    
    // Combine all parts
    const totalSize = header.byteLength + entry.byteLength + bytes.length;
    const buffer = new ArrayBuffer(totalSize);
    const view = new Uint8Array(buffer);
    
    // Copy header
    view.set(new Uint8Array(header), 0);
    // Copy entry
    view.set(new Uint8Array(entry), header.byteLength);
    // Copy image data
    view.set(bytes, header.byteLength + entry.byteLength);
    
    // Convert to data URL
    let binary = '';
    const bytesView = new Uint8Array(buffer);
    for (let i = 0; i < bytesView.length; i++) {
        binary += String.fromCharCode(bytesView[i]);
    }
    return 'data:image/x-icon;base64,' + btoa(binary);
}

function generateDownloadLinks(emoji, name) {
    // Get selected size
    const sizeSelect = document.getElementById('sizeSelect');
    const customSizeInput = document.getElementById('customSize');
    let size = 64; // default
    
    if (sizeSelect.value === 'custom') {
        size = parseInt(customSizeInput.value) || 64;
        // Clamp size between 16 and 512
        size = Math.max(16, Math.min(512, size));
    } else {
        size = parseInt(sizeSelect.value);
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;

    // Create emoji on canvas with better font support
    ctx.font = `${size * 0.8}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, size/2, size/2);

    // PNG download
    const pngDataUrl = canvas.toDataURL('image/png');
    document.getElementById('downloadPNG').href = pngDataUrl;
    document.getElementById('downloadPNG').download = `${name.replace(/\s+/g, '_')}_${size}x${size}.png`;

    // JPG download
    const jpgDataUrl = canvas.toDataURL('image/jpeg');
    document.getElementById('downloadJPG').href = jpgDataUrl;
    document.getElementById('downloadJPG').download = `${name.replace(/\s+/g, '_')}_${size}x${size}.jpg`;

    // ICO download
    const icoDataUrl = canvasToIco(canvas, size);
    document.getElementById('downloadICO').href = icoDataUrl;
    document.getElementById('downloadICO').download = `${name.replace(/\s+/g, '_')}_${size}x${size}.ico`;

    // SVG download
    const svgContent = `
        <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
            <text x="${size/2}" y="${size/2}" font-family="serif" font-size="${size * 0.8}" text-anchor="middle" dominant-baseline="central">${emoji}</text>
        </svg>
    `;
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
    const svgUrl = URL.createObjectURL(svgBlob);
    document.getElementById('downloadSVG').href = svgUrl;
    document.getElementById('downloadSVG').download = `${name.replace(/\s+/g, '_')}_${size}x${size}.svg`;
}

function copyText() {
    navigator.clipboard.writeText(currentEmoji.emoji).then(() => {
        alert('Emoji copied to clipboard!');
    });
}

function copyToClipboard(text, element) {
    navigator.clipboard.writeText(text).then(() => {
        // Visual feedback
        if (element) {
            element.textContent = '✅ Copied!';
            setTimeout(() => {
                element.textContent = 'Copy';
            }, 1000);
        }
    });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Search functionality with debounce
    document.getElementById('searchInput').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchEmojis(e.target.value);
        }, 300);
    });

    // Close modal when clicking outside
    document.getElementById('emojiModal').addEventListener('click', (e) => {
        if (e.target.id === 'emojiModal') {
            closeModal();
        }
    });

    // Close button event
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Copy button in modal
    const copyBtn = document.getElementById('copyTextBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', copyText);
    }
    
    // Size selection events
    const sizeSelect = document.getElementById('sizeSelect');
    const customSizeInput = document.getElementById('customSize');
    
    // Hide custom size input by default
    customSizeInput.classList.add('hidden');
    
    sizeSelect.addEventListener('change', function() {
        if (this.value === 'custom') {
            customSizeInput.classList.remove('hidden');
        } else {
            customSizeInput.classList.add('hidden');
        }
        
        // Regenerate download links with new size
        if (currentEmoji) {
            generateDownloadLinks(currentEmoji.emoji, currentEmoji.name);
        }
    });
    
    customSizeInput.addEventListener('input', function() {
        // Regenerate download links with new size
        if (currentEmoji) {
            generateDownloadLinks(currentEmoji.emoji, currentEmoji.name);
        }
    });

    // Load emojis on page load
    loadEmojis();
});
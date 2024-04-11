function handleFileUpload() {
    const fileInput = document.getElementById('csvFileInput');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (event) {
            const csvText = event.target.result;
            processCSV(csvText);
        };

        reader.readAsText(file);
    } else {
        alert('Please select a CSV file.');
    }
}



function parseCSV(csvText) {
    const parsedData = Papa.parse(csvText, { header: true });
    return parsedData.data;
}

async function searchGenreInfo(artist, title) {
    //todo
    //we need to convert artist to MBIDs, which doesnt seem that simple
    //time to look at api documentation for years!
}

async function processCSV(csvText) {
    const tracks = parseCSV(csvText);

    //cache
    const genreCache = {};

    for (const track of tracks) {
        const { artist, title } = track;

        // Check if genre information is already cached
        if (genreCache[artist] && genreCache[artist][title]) {
            console.log(`Genre information for ${artist} - ${title} found in cache: ${genreCache[artist][title]}`);
        } else {
            // Search for genre information
            try {
                const genres = await searchGenreInfo(artist, title);
                console.log(`Genre information for ${artist} - ${title}: ${genres.join(', ')}`);

                // Cache the genre information
                if (!genreCache[artist]) {
                    genreCache[artist] = {};
                }
                genreCache[artist][title] = genres;
            } catch (error) {
                console.error(error.message);
            }
        }
    }
}

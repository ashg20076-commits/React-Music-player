export async function getSongs() {
    const response = await fetch(
        "https://itunes.apple.com/search?term=the+weeknd&entity=song&limit=25"
    );

    if (!response.ok) {
        throw new Error("Failed to fetch songs");
    }

    const data = await response.json();

    return data.results
        .filter(song => song.previewUrl)
        .map(song => ({
            id: song.trackId,
            name: song.trackName,
            artist: song.artistName,
            image: song.artworkUrl100.replace("100x100", "600x600"),
            audio: song.previewUrl,
            duration: song.trackTimeMillis
        }));
}
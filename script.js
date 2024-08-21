async function getSongs(folder) {
    let a = await fetch(`http://127.0.0.1:5501/assets/albums/${folder}`);
    let response = await a.text();

    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    let songsUrl = [];
    let songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3") || element.href.endsWith(".m4a")) {
            songsUrl.push(element.href);


            // console.log(decodeURI(element.href))
            songs.push(decodeURI(element.href).split(`/${folder}/`)[1].replaceAll(".mp3", "").replaceAll("%20", " ").replaceAll(".m4a", "").replaceAll("_", ""));
        }
    }
    let songlist = document.querySelector(".songlst").getElementsByTagName("ul")[0];
    songlist.innerHTML = "";
    for (const song of songs) {
        songlist.innerHTML = songlist.innerHTML + `<li> <img src="assets/music.svg" class="invert">
                        <div class="songinfo">
                            <div class="songname">${song}</div>
                            <div class="songartist">one piece</div>
                        </div>
                        <div class="playnow">
                            <span>Play</span>
                            <img src="assets/playbar_play.svg" class="invert">
                        </div></li>`;
    }
    // attach event listener to each song in library
    Array.from(document.querySelector(".songlst").getElementsByTagName("li")).forEach((e, index) => {
        e.addEventListener("click", () => {
            playMusic(songs, songsUrl, index, true);

        })
    })


    return [songsUrl, songs];
}



function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}


//play the song
const playMusic = (songs, songsUrl, track, flag) => {
    currentSong.src = `${songsUrl[track]}`
    document.querySelector(".songInfo").textContent = `${songs[track]}`
    if (flag) {
        currentSong.play();
        playbar_play.src = "assets/playbar_pause.svg"
        if (currentSong.paused) {
            playbar_play.src = "assets/playbar_play.svg";
        } else {
            playbar_play.src = "assets/playbar_pause.svg";
        }
    } else {
    }
}


let currentSong = new Audio();
let playbar_play = document.querySelector("#play_pause");
let playbar_prev = document.querySelector("#previousSong");
let playbar_next = document.querySelector("#nextSong");
let currFolder = "playlist1";




async function displayAlbums() {
    let a = await fetch("http://127.0.0.1:5501/assets/albums")
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    
    let anchors = div.getElementsByTagName("a")

    let array = Array.from(anchors);

    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/albums/")) {
            
            let folder = e.href.split("/").slice(-1)[0];


            // get metadata
            let a = await fetch(`http://127.0.0.1:5501/assets/albums/${folder}/info.json`)
            let response = await a.json();

            let cardContainer = document.querySelector(".cardContainer")
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div class="card" data-folder="${folder}">
                        <div class="play">
                            <img src="assets/play.svg" alt="">
                        </div>
                        <img src="assets/albums/${folder}/cover.jpg" alt="">
                        <h3>${response.title}</h3>
                        <p>${response.description}</p>
                     </div>`
        }

    }

    // card click
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener('click', async (item) => {
            currFolder = item.currentTarget.dataset.folder;
            [songsUrl, songs] = await getSongs(currFolder);
            playMusic(songs, songsUrl, 0, true);
        })
    });

}



(async function main() {
    let songs = [];
    let songsUrl = [];

    [songsUrl, songs] = await getSongs(currFolder);
    playMusic(songs, songsUrl, 0, false);

    //display all the albums 
    await displayAlbums()








    // attach event listener to playbar
    playbar_play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            playbar_play.src = "assets/playbar_pause.svg"
        } else {
            currentSong.pause();
            playbar_play.src = "assets/playbar_play.svg"
        }
    })

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".duration").textContent = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })


    // add event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        currentSong.currentTime = (e.offsetX / e.target.getBoundingClientRect().width) * currentSong.duration;
    })

    // event listener to volume seekbar
    document.querySelector("#volumeseekbar").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if(currentSong.volume > 0 ){
            document.querySelector("#volume").src = "assets/volume.svg";
        }
    })

    // add event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    })
    //close hamburger
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    //Add eventlistener to previous and next
    document.querySelector("#previousSong").addEventListener("click", () => {
        let index = songsUrl.indexOf(currentSong.src);
        if (index != 0) {
            playMusic(songs, songsUrl, index - 1, true);
        }
    })

    document.querySelector("#nextSong").addEventListener("click", () => {
        let index = songsUrl.indexOf(currentSong.src);
        if (index != (songsUrl.length - 1)) {
            playMusic(songs, songsUrl, index + 1, true);
        }
    })

    //mute on click
    document.querySelector("#volume").addEventListener("click", (e) =>{
        if(currentSong.volume == 0){
            currentSong.volume = 0.5;
            e.target.src = "assets/volume.svg";
            document.querySelector("#volumeseekbar").value = 50;
        }else{
            currentSong.volume = 0;
             e.target.src = "assets/mute.svg";
             document.querySelector("#volumeseekbar").value = 0;

        }
    })



})()





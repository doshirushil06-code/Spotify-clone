
var currentAudio = null;
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder
  // Fetch local JSON
  let response = await fetch(`${folder}/${folder.split("/").pop()}.json`);
  let data = await response.json();
// songs = data
//     .filter(song => song.Audio_URL && song.Audio_URL.toLowerCase().endsWith(".mp3"))
//     .map(song => ({
//         title: song.title.trim(),
//         artist: song.artist.trim(),
//         Audio_URL: song.Audio_URL.trim()
//     }));

  let songs = [];

  for (let i = 0; i < data.length; i++) {
    let song = data[i];
    if (song.Audio_URL && song.Audio_URL.endsWith(".mp3")) {
      songs.push(song);
    }
  }

  let songUL = document.querySelector(".songList ul");
  songUL.innerHTML = "";

  songs.forEach((song, index) => {
    songUL.innerHTML += `<li>
      <img src="images/music.svg" alt="music">
      <div class="info">
          <div>${song.title}</div>
          <div>${song.artist}</div>
      </div>
      <div class="playnow">
          <span>Play Now</span>
          <img src="images/play.svg" alt="Play Button">
      </div>
    </li>`;
  });

  // ✅ Show first song by default (no autoplay)
  if (songs.length > 0) {
    playMusic(songs[0], true);
  }

  // Attach event listener to each song
  Array.from(songUL.getElementsByTagName("li")).forEach((e, index) => {
    e.addEventListener("click", () => {
      playMusic(songs[index]);
    });
  });
  return songs;
}


var playMusic = function (track, pause = false) {
  // Stop any currently playing song
  if (currentAudio) currentAudio.pause();

  // Create a new Audio object
  currentAudio = new Audio(track.Audio_URL);

  // Update song info UI immediately
  document.querySelector(".songinfo").innerText = track.Audio_URL.split("/")[2];
  document.querySelector(".current-time").innerText = "00:00 / 00:00";

  // Listen for time updates while playing
  currentAudio.addEventListener("timeupdate", () => {
    document.querySelector(".current-time").innerText =
      `${secondsToMinutesSeconds(currentAudio.currentTime)} / ${secondsToMinutesSeconds(currentAudio.duration)}`;
    document.querySelector(".circle").style.left =
      (currentAudio.currentTime / currentAudio.duration) * 100 + "%";
  });

  // ✅ If pause=false → autoplay, else just load metadata
  if (!pause) {
    currentAudio.play();
    play.src = "images/pause.svg";
    console.log("Playing:", track.title);
  } else {
    // Wait for metadata to load (to show total duration)
    currentAudio.addEventListener("loadedmetadata", () => {
      const total = secondsToMinutesSeconds(currentAudio.duration);
      document.querySelector(".current-time").innerText = `00:00 / ${total}`;
      document.querySelector(".circle").style.left = "0%";
      play.src = "images/play.svg"; // keep play icon
    });
  }
};
async function main() {
  songs = await getSongs("songs/Love");
  console.log("All songs:", songs);



  // attch an event listener to play, next and previous


  play.addEventListener("click", () => {
    if (currentAudio) {
      if (currentAudio.paused) {
        currentAudio.play();
        play.src = "images/pause.svg";  // when playing
      } else {
        currentAudio.pause();
        play.src = "images/play.svg";   // when paused
      }
    }
  });
  //event listner for song timing and seekbar
  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentAudio.currentTime = ((currentAudio.duration) * percent) / 100
  })

  // event listner for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0"
  })



  // Add an event listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%"
  })

  // add an event listener for previous button 
  previous.addEventListener("click", () => {
    let index = songs.findIndex(song => currentAudio.src.includes(song.Audio_URL));
    if (index > 0) {
      playMusic(songs[index - 1]);
    }
    else {
      playMusic(songs[songs.length - 1]);
    }
  });

  // add an event listener for next button 
  next.addEventListener("click", () => {
    let index = songs.findIndex(song => currentAudio.src.includes(song.Audio_URL));
    if (index < songs.length - 1) {
      playMusic(songs[index + 1]);
    }
    else {
      playMusic(songs[0]);
    }
  });

  //event listner to volume
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",
    (e) => {
      currentAudio.volume = parseInt(e.target.value) / 100
    })

  const muteButton = document.querySelector(".mute-button");

  muteButton.addEventListener("click", () => {
    currentAudio.muted = !currentAudio.muted;
    if (currentAudio.muted) {
      muteButton.src = "images/mute.svg"; // change icon
      currentAudio.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    } else {
      muteButton.src = "images/volume.svg"; // change icon
      currentAudio.volume=.10;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10;

    }
  });


  //load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
    })
  });
}



main();








/**
 * Global variables
 */
const alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
const musicGrid = $("#music-grid");
const playButton = $("#play-minuetto");
const randomiseButton = $("#btn-randomise");
const checkboxes = $("#checkboxes-minuetti");
const mp3list = originalMinuetti(alphabet);
const randomIDs = [];

let letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"];
let sequence = [];
let allMP3 = [];
let isPlaying = false;
let singleHowl = null;

/**
 * Creates all objects with all 12 original minuetti
 * Defines the array of objects containing all full minuetti
 * @param {[String]} letter
 */
function originalMinuetti(letter) {
    return letter.map(item => ({
        name: `Minuetto ${item}`,
        path: `assets/music/full/minuetto${item.toUpperCase()}.mp3`
    }));
}

/**
 * Pads 0 for correct filename formatting
 * @param {Number} value
 */
function zeroPadd(value) {
    return value < 10 ? "0" + value : value;
}

/**
 * Generates random selections from selected letters
 * Restores play button after new randomisation
 */
function randomise() {
    playButton.prop("disabled", false).text("Play Minuetto");
    musicGrid.find(".selected").removeClass("selected");
    $(".bar").removeClass("playing");
    for (let i = 1; i <= 12; i++) {
        const randomIndex = Math.floor(Math.random() * letters.length);
        randomIDs[i - 1] = letters[randomIndex] + zeroPadd(i);
    }
    randomIDs.forEach(id => $(`#${id}`).addClass("selected"));
    createSequence();
}

/**
 * Generates grid from user-selected values
 * Rebuilds the array of letters only from checked checkboxes
 * Hides elements if no letters selected
 * Stops music if there's music and last remaining label gets deselected
 */
function buildGrid() {
    const noSelection = letters.length === 0;
    letters = checkboxes
        .find(":checkbox:checked")
        .get()
        .map(element => element.value);

    playButton.prop("disabled", noSelection);
    randomiseButton.prop("disabled", letters.length < 2);
    musicGrid.toggle(!noSelection);
    stopAll();
    if (noSelection) return;
    let html = "";
    for (let i = 0; i < letters.length; i++) {
        html += `<div id="music-row-${letters[i]}" class="row no-gutters">`;
        for (let j = 1; j <= 12; j++) {
            const columnID = letters[i] + zeroPadd(j);
            html += `<div class="col-1"><button id="${columnID}" class="btn bar song">${columnID.toUpperCase()}</button></div>`;
        }
        html += "</div>";
    }
    musicGrid.html(html);
    randomise();
}

/**
 * Creates a song from random bars
 * Populates sequence variable with Howler Objects
 * Rebuilds sequence array with Howler objects
 * Handles all bars but the last one
 * Plays following bar
 */
function createSequence() {
    isPlaying = false;
    if (sequence.length) {
        sequence.forEach(sound => sound.unload());
    }
    sequence = randomIDs.map((id, i) => {
        return new Howl({
            src: `assets/music/randomiser/${id}.mp3`,
            onplay: () => {
                $(`#${id}`).addClass("playing");
            },
            onend: () => {
                $(`#${id}`).removeClass("playing");
                if (i < randomIDs.length - 1) {
                    sequence[i + 1].play();
                } else {
                    isPlaying = false;
                    playButton.text("Play Again!");
                    $(".bar")
                        .prop("disabled", false)
                        .removeClass("playing disabled");
                }
            }
        });
    });
}

/**
 * Plays sequence
 * Stop all sounds before playing a sequence
 */
function playSequence() {
    stopAll();
    isPlaying = true;
    sequence[0].play();
    playButton.text("Stop minuetto");
}

/**
 * Stops all (to be called before playing any sound)
 */
function stopAll() {
    stopSequence();
    stopSingle();
    allMP3.forEach(element => element.trigger("stop"));
    $(".bar").removeClass("playing");
}

/**
 * Stops sequence
 */
function stopSequence() {
    isPlaying = false;
    sequence.forEach(bar => bar.stop());
    playButton.text("Play Minuetto");
}

/**
 * Stops single
 * Handle already playing single bar sound
 */
function stopSingle() {
    if (singleHowl && singleHowl.playing()) {
        singleHowl.stop();
    }
}

/**
 * Toggles sequence play / stop state
 */
function togglePlaySequence() {
    isPlaying = !isPlaying;
    if (isPlaying) {
        playSequence();
    } else {
        stopSequence();
    }
}

/**
 * EVENTS
 */
checkboxes.on("change", ":checkbox", buildGrid);
randomiseButton.on("click", randomise);
playButton.on("click", togglePlaySequence);
$(document).on("click", colapseNavbar);

/**
 * Grid to play individual cells
 * jQuery .on() method with dynamic handler for .bar elements
 * Delegates listeners to parent element
 * Sets new sound and play it
 */
musicGrid.on("click", ".bar", function() {
    const $this = $(this);
    stopAll();
    singleHowl = new Howl({
        src: [`assets/music/cells/${this.id}.mp3`],
        onplay: () => {
            $this.addClass("playing");
        },
        onstop: () => {
            $this.removeClass("playing");
        },
        onend: () => {
            $this.removeClass("playing");
        }
    });
    singleHowl.play();
});

/**
 * Creates buttons to play original minuetti
 */
function newMP3(mp3) {
    const sound = new Howl({ src: mp3.path });
    const element = $(`<div/>`, {
        class: "btn col-6 col-md-3 individual-minuetto btn-primary btn-lg ",
        text: mp3.name,
        on: {
            click() {
                $(this).trigger(sound.playing() ? "stop" : "play");
            },
            play() {
                stopAll();
                $(this)
                    .text(`Stop ${mp3.name}`)
                    .addClass("minuetto-playing");
                sound.play();
            },
            stop() {
                $(this)
                    .text(mp3.name)
                    .removeClass("minuetto-playing");
                sound.stop();
            }
        }
    });
    sound.on("end", () => element.trigger("stop"));
    return element;
}

/**
 * Smooth scrolling, adapted from https://www.w3schools.com/howto/howto_css_smooth_scroll.asp
 */
$(window).on("scroll", function() {
    if (document.body.scrollTop > 500 || document.documentElement.scrollTop > 500) {
        $("#btn-to-top").addClass("active");
    } else {
        $("#btn-to-top").removeClass("active");
    }
});

/**
 * Navigates to sections, adapted from: https://www.roytuts.com/scroll-to-a-section-having-id-attribute-using-jquery/
 */
$(".scrolling-link").on("click", function(event) {
    event.preventDefault();

    let location = $($(this).attr("href")).offset().top;
    $("body, html").animate({ scrollTop: location - 50 }, 800);
});

/**
 * Closes expanded navbar when clicked elsewhere
 */
function colapseNavbar() {
    $(".navbar-collapse").collapse("hide");
}

/**
 * INIT APP
 * Populates array of $ elements & Appends to div
 */
allMP3 = mp3list.map(newMP3);
$("#minuetti").append(allMP3);

const checkboxesHTML = alphabet.reduce((html, letter, i) => {
    const checkboxID = `checkbox-${i + 1}`;
    return (html += `<div class = "col-3 col-md-2 col-lg-1">
        <input type="checkbox" id="${checkboxID}" value="${letter.toLowerCase()}" checked />
        <label for="${checkboxID}">${letter}</label>
    </div>`);
}, "");

checkboxes.html(checkboxesHTML);

buildGrid();

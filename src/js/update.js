const uaup = require('uaup-js');

const defaultStates = {
    Checking: "Checking for Updates",
    Found: "Update Found",
    NotFound: "No Update Found",
    Downloading: "Downloading...",
    Unzipping: "Installing...",
    Cleaning: "Finalizing...",
    Launch: "Launching..."
};

const updateOptions={
    gitRepo: "xphaseUX",
    gitUsername: "brandonshults01",
    appName: "XPhaseCompanion",
    appExecutableName: "XPhaseCompanion.exe",
    progressBar: document.getElementById("download"),
    label: document.getElementById("download-label"),
    stageTitles: defaultStates,
};

uaup.Update(updateOptions);
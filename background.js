var currentTheme = "";

var primaryColors = [
    "#D53662",
    "#E9EA4F",
    "#429EE7",
    "#D8702E",
    "#825EE2",
    "#85E549",
];

var colors = {
    dark: {
        main: "#2F343F",
        primary: primaryColors,
        text: "#D3DAE3",
        textShadow: "#AFB8C6",
        separator: "#272A34",
        border: "#2B2E39",
        sidebar: "#383C4A",
        highlight: "#000"
    },
    light: {
        main: "#E7E8EB",
        primary: primaryColors,
        text: "#5C616C",
        textShadow: "#525D76",
        separator: "#CFD6E6",
        border: "#DCDFE3",
        sidebar: "#F5F6F7",
        highlight: "#FFF"
    }
};

function hexToRgbA(hex, opacity) {
    var c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split("");
        if (c.length == 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = "0x" + c.join("");
        return (
            "rgba(" +
                [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(",") +
                "," +
                opacity || 1 + ")"
        );
    }
    throw new Error("Bad Hex");
}

function getRandomColor(colors) {
    return colors[Math.floor(Math.random() * colors.length)];
}

function generateTheme(theme) {
    var primaryColor = getRandomColor(colors[theme].primary);

    return {
        images: {
            additional_backgrounds: ["confetti.png"]
        },
        properties: {
            additional_backgrounds_alignment: ["right center"]
        },
        colors: {
            frame: colors[theme].main,
            frame_inactive: colors[theme].main,

            tab_text: colors[theme].text,
            tab_background_text: colors[theme].textShadow,

            tab_line: primaryColor,
            tab_loading: primaryColor, // Firefox 60
            icons_attention: primaryColor, // Firefox 60

            toolbar: hexToRgbA(colors[theme].highlight, 0),
            toolbar_top_separator: colors[theme].separator,
            toolbar_bottom_separator: colors[theme].border,
            toolbar_vertical_separator: colors[theme].border,

            toolbar_field: hexToRgbA(colors[theme].main, 0.8),
            toolbar_field_text: colors[theme].text,
            toolbar_field_border: colors[theme].border,
            toolbar_field_separator: hexToRgbA(colors[theme].highlight, 0.2),

            toolbar_field_focus: colors[theme].main, // Firefox 61
            toolbar_field_border_focus: primaryColor, // Firefox 61

            toolbar_field_highlight: primaryColor, // Firefox 67
            toolbar_field_highlight_text: hexToRgbA(
                colors[theme].highlight,
                0.9
            ), // Firefox 61

            button_background_hover: hexToRgbA(colors[theme].highlight, 0.12), // Firefox 60
            button_background_active: primaryColor, // Firefox 60

            bookmark_text: colors[theme].text,

            popup: colors[theme].main, // Firefox 60
            popup_text: colors[theme].text, // Firefox 60
            popup_border: colors[theme].border,
            popup_highlight: primaryColor, // Firefox 60
            popup_highlight_text: hexToRgbA(colors[theme].highlight, 0.9), // Firefox 60

            sidebar: colors[theme].sidebar, // Firefox 63
            sidebar_text: colors[theme].text, // Firefox 63
            sidebar_border: colors[theme].border, // Firefox 64
            sidebar_highlight: primaryColor, // Firefox 63
            sidebar_highlight_text: hexToRgbA(colors[theme].highlight, 0.9), // Firefox 63

            ntp_text: colors[theme].text, // Firefox 63
            ntp_background: colors[theme].main // Firefox 63
        }
    };
}

function setTheme(theme) {
    if (currentTheme === theme) {
        // No point in changing the theme if it has already been set.
        return;
    }
    currentTheme = theme;
    browser.theme.update(generateTheme(theme));
}

function checkTime() {
    let date = new Date();
    let hours = date.getHours();
    // Will set the sun theme between 8am and 8pm.
    if (hours > 8 && hours < 20) {
        setTheme("light");
    } else {
        setTheme("dark");
    }
}

/**
 * Sets a color scheme for the theme.
 * If browser supports "prefers-color-scheme" it will respect the setting for light or dark mode
 * otherwise it will set a dark theme during night time
 */
function setColorScheme() {
    const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)")
        .matches;
    const isLightMode = window.matchMedia("(prefers-color-scheme: light)")
        .matches;
    const isNotSpecified = window.matchMedia(
        "(prefers-color-scheme: no-preference)"
    ).matches;
    const hasNoSupport = !isDarkMode && !isLightMode && !isNotSpecified;

    window
        .matchMedia("(prefers-color-scheme: dark)")
        .addListener(e => e.matches && setTheme("dark"));
    window
        .matchMedia("(prefers-color-scheme: light)")
        .addListener(e => e.matches && setTheme("light"));

    if (isDarkMode) setTheme("dark");
    if (isLightMode) setTheme("light");
    if (isNotSpecified || hasNoSupport) {
        checkTime();
        // Set up an alarm to check this regularly.
        browser.alarms.onAlarm.addListener(checkTime);
        browser.alarms.create("checkTime", { periodInMinutes: 5 });
    }
}

setColorScheme();
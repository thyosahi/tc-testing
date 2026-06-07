function normalizeSocialSource(source) {
    if (!source || source === "") return source;
    var s = source.toLowerCase();

    if (s === "meta" || s === "fb" || s === "facebook" || s.indexOf("facebook") >= 0 || s.indexOf("fb.com") >= 0) {
        return "facebook";
    }
    if (s === "ig" || s === "insta" || s === "instagram" || s.indexOf("instagram") >= 0) {
        return "instagram";
    }
    if (s === "linktr.ee" || s === "linktree" || s.indexOf("linktr.ee") >= 0 || s.indexOf("linktree") >= 0) {
        return "linktree";
    }
    if (s === "li" || s === "lnkd.in" || s === "linkedin" || s.indexOf("linkedin") >= 0 || s.indexOf("lnkd.in") >= 0) {
        return "linkedin";
    }
    if (s === "youtube.com" || s === "youtu.be" || s === "youtube" || s.indexOf("youtube") >= 0 || s.indexOf("youtu.be") >= 0) {
        return "youtube";
    }
    return source;
}

var lead_source = normalizeSocialSource(window.localStorage.getItem("_fm_ls") || "");
var lead_medium = window.localStorage.getItem("_fm_lm") || "";
var lead_campaign = window.localStorage.getItem("_fm_lc") || "";
var google_click_id = window.localStorage.getItem("_fm_gcid") || "";
var fb_click_id = window.localStorage.getItem("_fm_fbclid") || "";
var ga_client_id = window.localStorage.getItem("_fm_gaid") || "";

function urlHasTrackingParams() {
    var params = new URLSearchParams(window.location.search);
    return ["utm_source", "utm_medium", "utm_campaign", "gclid", "fbclid"].some(function (key) {
        var value = params.get(key);
        return value !== null && value.trim() !== "";
    });
}

if (lead_source === "" || urlHasTrackingParams()) {
    const social_media = [
        "digg", "facebook", "fb", "flickr", "friendfeed", "google+", "hackernews", "hootsuite", "instagram", "ig", "insta", "linkedin", "lnkd.in", "li", "livejournal", "meebo", "metacafe", "mixx", "myspace", "ning", "pinterest", "quora", "reddit", "seesmic", "slashdot", "slideshare", "slide", "snapchat", "stumbleupon", "squidoo", "technorati", "tiktok", "tip'd", "tipd", "triiibes", "tumblr", "twitter", "x", "x.com", "vimeo", "wikipedia", "xing", "youtube", "youtube.com", "youtu.be", "zhihu", "linktree", "linktr.ee", "whatsapp", "discord", "telegram", "meta",
    ];
    const search_engines = ["google", "yahoo", "bing", "baidu", "aol", "duckduckgo", "ask", "yandex"];
    const display_networks = ["stackadapt"];

    const referrer = function () {
        var ref = document.referrer.toLowerCase();

        if (ref.startsWith("http")) {
            const urlRef = new URL(ref);
            var referrerHost = urlRef.hostname;

            if (referrerHost.startsWith("www")) {
                ref = referrerHost.substring(4);
            } else {
                ref = referrerHost;
            }
        }

        if (ref !== "") {
            var matches = search_engines.filter((domain) => ref.includes(domain));
            if (matches.length > 0) {
                ref = matches[0];
            } else {
                matches = social_media.filter((domain) => ref.includes(domain));
                if (matches.length > 0) {
                    ref = matches[0];
                }
            }
        }

        return ref;
    }().toLowerCase();

    const cookies = document.cookie;
    const url_search_params = new URLSearchParams(window.location.search);
    var params = new Map();
    for (const entry of url_search_params.entries()) {
        const key = entry[0].toLowerCase();
        const value = entry[1];
        params.set(key, value);
    }

    google_click_id = params.has("gclid") ? params.get("gclid") : "";
    fb_click_id = params.has("fbclid") ? params.get("fbclid") : "";
    ga_client_id = "";
    cookies.split(";").forEach(
        (cookie) => {
            if (cookie.length > 0) {
                var cookieSplits = cookie.trim().split("=");
                if (cookieSplits.length > 1) {
                    if ("_ga" === cookieSplits[0].trim()) {
                        var full_ga_client_id = cookieSplits[1].trim();
                        var splits = full_ga_client_id.split(".");
                        if (ga_client_id === "") {
                            for (var i = 2; i < splits.length; ++i) {
                                ga_client_id += "." + splits[i];
                            }
                            ga_client_id = ga_client_id.substring(1);
                        }
                    }
                }
            }
        }
    );

    var utm_source = params.get("utm_source") ? params.get("utm_source").trim().toLowerCase() : "";
    var utm_medium = params.get("utm_medium") ? params.get("utm_medium").trim().toLowerCase() : "";
    var utm_campaign = params.get("utm_campaign") ? params.get("utm_campaign").trim().toLowerCase() : "";
    var source = params.get("source") ? params.get("source").trim().toLowerCase() : "";

    var utm_combined = (utm_source + " " + utm_medium + " " + utm_campaign).toLowerCase();

    lead_source = "direct";
    lead_medium = "direct traffic";
    lead_campaign = params.has("utm_campaign") ? params.get("utm_campaign") : "";

    var paid_social_medium =
        utm_medium.indexOf("paidsocial") >= 0 ||
        utm_medium.indexOf("paid social") >= 0 ||
        utm_medium.indexOf("paid_social") >= 0 ||
        utm_medium.indexOf("paid+social") >= 0 ||
        utm_medium.indexOf("paid_search") >= 0 ||
        utm_medium.indexOf("paid+search") >= 0 ||
        utm_medium.indexOf("paid search") >= 0 ||
        utm_medium.indexOf("ppc") >= 0 ||
        utm_medium.indexOf("cpc") >= 0 ||
        utm_medium.indexOf("cps") >= 0 ||
        /\bpaid\b/.test(utm_medium) ||
        utm_medium.indexOf("paid,") >= 0;

    if (google_click_id !== "") {
        lead_medium = "paid search";
        lead_source = "google";
    } else if (fb_click_id !== "") {
        if (utm_medium.includes("paidsocial") || utm_medium.includes("paid") || utm_medium.includes("ppc") || utm_medium.includes("cpc")) {
            lead_medium = "paid social";
        } else {
            lead_medium = "organic social";
        }
        lead_source = "facebook";
    } else if (
        (utm_medium === "social" && social_media.includes(utm_source)) ||
        (utm_medium === "organic social" && social_media.includes(referrer)) ||
        utm_source.indexOf("organicsocial") >= 0 ||
        utm_medium.indexOf("organicsocial") >= 0 ||
        utm_source.indexOf("organic social") >= 0 ||
        utm_medium.indexOf("organic social") >= 0 ||
        utm_source.indexOf("organic_social") >= 0 ||
        utm_medium.indexOf("organic_social") >= 0 ||
        utm_source.indexOf("organic+social") >= 0 ||
        utm_medium.indexOf("organic+social") >= 0
    ) {
        lead_medium = "organic social";
        if (social_media.includes(utm_source)) {
            lead_source = normalizeSocialSource(utm_source);
        } else if (social_media.includes(referrer)) {
            lead_source = normalizeSocialSource(referrer);
        } else {
            lead_source = referrer !== "" ? normalizeSocialSource(referrer) : (utm_source !== "" ? normalizeSocialSource(utm_source) : "social");
        }
    } else if (utm_medium === "display") {
        lead_medium = "display";
        if (display_networks.includes(utm_source)) {
            lead_source = utm_source;
        } else if (display_networks.includes(referrer)) {
            lead_source = referrer;
        }
    } else if (utm_source.indexOf("email") >= 0
        || utm_medium.indexOf("email") >= 0
        || source.indexOf("email") >= 0
    ) {
        lead_medium = "email marketing";
        lead_source = "email";
    } else if (
        (utm_source === "google" || utm_source === "google_ads" || utm_source.replace(/\+/g, "_") === "google_ads") &&
        (utm_medium.indexOf("paid_search") >= 0 || utm_medium.indexOf("paid+search") >= 0 || utm_medium.indexOf("paid search") >= 0 || utm_medium.indexOf("paid ads") >= 0 || utm_medium === "edward" || utm_medium.indexOf("ppc") >= 0 || utm_medium.indexOf("cpc") >= 0 || utm_medium.indexOf("cps") >= 0)
    ) {
        lead_source = "google";
        lead_medium = "paid search";
    } else if (
        (utm_source === "bing" || utm_source === "bing_ads" || utm_source.indexOf("microsoft") >= 0) &&
        (utm_medium.indexOf("paid_search") >= 0 || utm_medium.indexOf("paid+search") >= 0 || utm_medium.indexOf("paid search") >= 0 || utm_medium.indexOf("paid ads") >= 0 || utm_medium === "edward" || utm_medium.indexOf("ppc") >= 0 || utm_medium.indexOf("cpc") >= 0 || utm_medium.indexOf("cps") >= 0)
    ) {
        lead_source = "bing";
        lead_medium = "paid search";
    } else if (utm_source.includes("adword") || utm_source.includes("ppc") || utm_source.includes("cpc")) {
        lead_medium = "paid search";
        if (utm_source.includes("adword")) {
            lead_source = "google";
        } else if (referrer !== "") {
            lead_source = referrer;
        }
    } else if (
        (paid_social_medium && (social_media.includes(utm_source) || social_media.includes(referrer))) ||
        utm_source.indexOf("paidsocial") >= 0 ||
        utm_medium.indexOf("paidsocial") >= 0 ||
        utm_source.indexOf("paid social") >= 0 ||
        utm_medium.indexOf("paid social") >= 0 ||
        utm_source.indexOf("paid_social") >= 0 ||
        utm_medium.indexOf("paid_social") >= 0 ||
        utm_source.indexOf("paid+social") >= 0 ||
        utm_medium.indexOf("paid+social") >= 0
    ) {
        lead_medium = "paid social";
        if (social_media.includes(utm_source)) {
            lead_source = normalizeSocialSource(utm_source);
        } else if (social_media.includes(referrer)) {
            lead_source = normalizeSocialSource(referrer);
        } else if (referrer !== "") {
            lead_source = normalizeSocialSource(referrer);
        }
    } else if (utm_source.includes("google") && (utm_medium.includes("paid_search") || utm_medium.includes("paid+search") || utm_medium.includes("paid search"))) {
        lead_source = "google";
        lead_medium = "paid search";
    } else if (
        utm_source.indexOf("adword") >= 0 || utm_medium.indexOf("adword") >= 0 || utm_campaign.indexOf("adword") >= 0 ||
        utm_source.indexOf("ppc") >= 0 || utm_medium.indexOf("ppc") >= 0 || utm_campaign.indexOf("ppc") >= 0 ||
        utm_source.indexOf("cpc") >= 0 || utm_medium.indexOf("cpc") >= 0 || utm_campaign.indexOf("cpc") >= 0 ||
        utm_source.indexOf("paid ads") >= 0 || utm_medium.indexOf("paid ads") >= 0 || utm_campaign.indexOf("paid ads") >= 0 ||
        utm_source.indexOf("paid_search") >= 0 || utm_medium.indexOf("paid_search") >= 0 || utm_campaign.indexOf("paid_search") >= 0 ||
        utm_source.indexOf("paid+search") >= 0 || utm_medium.indexOf("paid+search") >= 0 || utm_campaign.indexOf("paid+search") >= 0
    ) {
        lead_medium = "paid search";
        lead_source = referrer !== "" ? referrer : "other";
    } else if (
        utm_source !== "" || utm_medium !== "" || utm_campaign !== ""
    ) {
        if (
            utm_combined.indexOf("email") < 0 &&
            utm_combined.indexOf("adword") < 0 &&
            utm_combined.indexOf("ppc") < 0 &&
            utm_combined.indexOf("cpc") < 0 &&
            utm_combined.indexOf("paid ads") < 0 &&
            utm_combined.indexOf("paid") < 0 &&
            utm_combined.indexOf("paid_search") < 0 &&
            utm_combined.indexOf("paid+search") < 0 &&
            utm_combined.indexOf("paid social") < 0 &&
            utm_combined.indexOf("paid+social") < 0 &&
            utm_combined.indexOf("paid_social") < 0
        ) {
            lead_medium = "other campaigns";
            lead_source = "other";
        } else if (referrer === "google") {
            lead_medium = "paid search";
            lead_source = "google";
        } else if (utm_source.includes("adword") || utm_medium.includes("adword") || utm_source.includes("ppc") || utm_medium.includes("ppc") || utm_source.includes("cpc") || utm_medium.includes("cpc")) {
            lead_medium = "paid search";
            if (utm_source.includes("adword") || utm_medium.includes("adword")) {
                lead_source = "google";
            } else if (referrer !== "") {
                lead_source = referrer;
            }
        } else if (!(utm_source.includes("adword") || utm_medium.includes("adword") || utm_source.includes("ppc") || utm_medium.includes("ppc") || utm_source.includes("cpc") || utm_medium.includes("cpc") || utm_source.includes("email") || utm_medium.includes("email"))) {
            lead_medium = "other campaigns";
            lead_source = "other";
        }
    } else {
        if (referrer !== "") {
            if (social_media.includes(referrer)) {
                lead_source = normalizeSocialSource(referrer);
                lead_medium = "organic social";
            } else if (search_engines.includes(referrer)) {
                lead_source = referrer;
                lead_medium = "organic search";
            } else {
                lead_source = referrer;
                lead_medium = "referral";
            }
        }
    }

    lead_source = normalizeSocialSource(lead_source);
    window.localStorage.setItem("_fm_ls", lead_source);
    window.localStorage.setItem("_fm_lm", lead_medium);
    window.localStorage.setItem("_fm_lc", lead_campaign);
    window.localStorage.setItem("_fm_gcid", google_click_id);
    window.localStorage.setItem("_fm_fbclid", fb_click_id);
    window.localStorage.setItem("_fm_gaid", ga_client_id);
}

const field_name_vs_id = {
    lead_source: "f99aa72e-7ed2-4d6e-ae73-0086e6c8b738",
    lead_medium: "929078fa-6a96-4496-8fc5-074f422cd299",
    lead_campaign: "a82fbaab-c331-476d-9fce-1b15a45076e2",
    google_click_id: "5c49b4d4-49ed-4a0f-b643-58a77375964b",
    facebook_click_id: "ddfa5059-da33-42b2-9895-48c1813498ab",
    ga_client_id: "54314c82-e2e8-4f56-9feb-4725490ab242",
};

function populateForms() {
    var forms = document.querySelectorAll("form");
    for (var i = 0; i < forms.length; i++) {
        var inputs = forms[i].querySelectorAll("input[type=hidden], input[type=text]");
        for (var j = 0; j < inputs.length; j++) {
            var input = inputs[j];
            var input_name = (input.getAttribute("name") || "").toLowerCase().replace(/\s+/g, "_");
            var input_id = (input.getAttribute("id") || "").toLowerCase().replace(/\s+/g, "_");
            var input_data_url_key = (input.getAttribute("data-url-key") || "").toLowerCase().replace(/\s+/g, "_");

            var replaced = true;
            if (input_id.includes(field_name_vs_id.lead_source) || input_name.includes("lead_source") || input_id.includes("lead_source") || input_data_url_key.includes("lead_source")) {
                input.value = lead_source;
            } else if (input_id.includes(field_name_vs_id.lead_medium) || input_name.includes("lead_medium") || input_id.includes("lead_medium") || input_data_url_key.includes("lead_medium")) {
                input.value = lead_medium;
            } else if (input_id.includes(field_name_vs_id.lead_campaign) || input_name.includes("lead_campaign") || input_id.includes("lead_campaign") || input_data_url_key.includes("lead_campaign")) {
                input.value = lead_campaign;
            } else if (input_id.includes(field_name_vs_id.google_click_id) || input_name.includes("google_click_id") || input_id.includes("google_click_id") || input_data_url_key.includes("google_click_id")) {
                input.value = google_click_id;
            } else if (input_id.includes(field_name_vs_id.facebook_click_id) || input_name.includes("facebook_click_id") || input_id.includes("facebook_click_id") || input_data_url_key.includes("facebook_click_id")) {
                input.value = fb_click_id;
            } else if (input_id.includes(field_name_vs_id.ga_client_id) || input_name.includes("ga_client_id") || input_id.includes("ga_client_id") || input_data_url_key.includes("ga_client_id")) {
                input.value = ga_client_id;
            } else {
                replaced = false;
            }

            if (replaced && input_data_url_key !== "") {
                input.removeAttribute("data-url-key");
            }
        }
    }
}

if (document.readyState === "complete" || document.readyState === "interactive") {
    populateForms();
} else {
    window.addEventListener("DOMContentLoaded", populateForms);
    window.addEventListener("load", populateForms);
}


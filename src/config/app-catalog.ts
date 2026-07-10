import {
  Code2,
  FileText,
  Gamepad2,
  Gauge,
  Globe,
  MessagesSquare,
  Music,
  Package,
  Shield,
  Video,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface CatalogApp {
  /** Stable key used for selection/progress state. */
  id: string;
  name: string;
  /**
   * winget package id, passed to `winget install --id <id> --exact`.
   * Omitted for macOS-only apps.
   */
  wingetId?: string;
  /**
   * Homebrew cask token, passed to `brew install --cask <id>`.
   * Omitted for Windows-only apps.
   */
  brewId?: string;
  /** Only set for Microsoft Store packages ("msstore"); default source otherwise. */
  source?: "msstore";
  description: { en: string; tr: string };
}

export interface AppCategory {
  /** i18n key under "Apps.categories". */
  key: string;
  icon: LucideIcon;
  apps: CatalogApp[];
}

/**
 * Curated app catalog, grouped by category. Windows installs use `wingetId`
 * (following winutil's applications.json where available); macOS installs use
 * the `brewId` Homebrew cask. An app appears on a platform only when it has
 * the matching id. Adding an app is a single entry here — the page renders
 * whatever this table contains.
 */
export const appCatalog: AppCategory[] = [
  {
    key: "browsers",
    icon: Globe,
    apps: [
      {
        id: "chrome",
        name: "Google Chrome",
        wingetId: "Google.Chrome",
        brewId: "google-chrome",
        description: {
          en: "Google's fast and popular web browser",
          tr: "Google'ın hızlı ve popüler web tarayıcısı",
        },
      },
      {
        id: "firefox",
        name: "Mozilla Firefox",
        wingetId: "Mozilla.Firefox",
        brewId: "firefox",
        description: {
          en: "Open-source, privacy-focused browser",
          tr: "Açık kaynaklı, gizlilik odaklı tarayıcı",
        },
      },
      {
        id: "brave",
        name: "Brave",
        wingetId: "Brave.Brave",
        brewId: "brave-browser",
        description: {
          en: "Privacy browser with built-in ad blocking",
          tr: "Yerleşik reklam engelleyicili gizlilik tarayıcısı",
        },
      },
      {
        id: "opera",
        name: "Opera",
        wingetId: "Opera.Opera",
        brewId: "opera",
        description: {
          en: "Feature-rich browser with free VPN",
          tr: "Ücretsiz VPN içeren zengin özellikli tarayıcı",
        },
      },
      {
        id: "opera-gx",
        name: "Opera GX",
        wingetId: "Opera.OperaGX",
        brewId: "opera-gx",
        description: {
          en: "Gaming browser with CPU/RAM limiters",
          tr: "CPU/RAM sınırlayıcılı oyuncu tarayıcısı",
        },
      },
      {
        id: "edge",
        name: "Microsoft Edge",
        wingetId: "Microsoft.Edge",
        brewId: "microsoft-edge",
        description: {
          en: "Microsoft's Chromium-based browser",
          tr: "Microsoft'un Chromium tabanlı tarayıcısı",
        },
      },
      {
        id: "vivaldi",
        name: "Vivaldi",
        wingetId: "Vivaldi.Vivaldi",
        brewId: "vivaldi",
        description: {
          en: "Highly customizable power-user browser",
          tr: "İleri düzey özelleştirilebilir tarayıcı",
        },
      },
      {
        id: "chromium",
        name: "Chromium",
        wingetId: "Hibbiki.Chromium",
        brewId: "chromium",
        description: {
          en: "Open-source base of Chrome",
          tr: "Chrome'un açık kaynaklı temeli",
        },
      },
      {
        id: "librewolf",
        name: "LibreWolf",
        wingetId: "LibreWolf.LibreWolf",
        brewId: "librewolf",
        description: {
          en: "Hardened, telemetry-free Firefox fork",
          tr: "Sıkılaştırılmış, telemetrisiz Firefox türevi",
        },
      },
      {
        id: "tor-browser",
        name: "Tor Browser",
        wingetId: "TorProject.TorBrowser",
        brewId: "tor-browser",
        description: {
          en: "Anonymous browsing over the Tor network",
          tr: "Tor ağı üzerinden anonim gezinme",
        },
      },
      {
        id: "zen-browser",
        name: "Zen Browser",
        wingetId: "Zen-Team.Zen-Browser",
        brewId: "zen",
        description: {
          en: "Modern, minimal Firefox-based browser",
          tr: "Modern, sade Firefox tabanlı tarayıcı",
        },
      },
      {
        id: "waterfox",
        name: "Waterfox",
        wingetId: "Waterfox.Waterfox",
        brewId: "waterfox",
        description: {
          en: "Privacy-respecting Firefox derivative",
          tr: "Gizliliğe saygılı Firefox türevi",
        },
      },
      {
        id: "floorp",
        name: "Floorp",
        wingetId: "Ablaze.Floorp",
        brewId: "floorp",
        description: {
          en: "Flexible Firefox-based browser from Japan",
          tr: "Esnek, Firefox tabanlı Japon tarayıcısı",
        },
      },
      {
        id: "arc",
        name: "Arc",
        wingetId: "TheBrowserCompany.Arc",
        brewId: "arc",
        description: {
          en: "Reimagined browser with spaces and profiles",
          tr: "Alanlar ve profillerle yeniden tasarlanmış tarayıcı",
        },
      },
    ],
  },
  {
    key: "communication",
    icon: MessagesSquare,
    apps: [
      {
        id: "discord",
        name: "Discord",
        wingetId: "Discord.Discord",
        brewId: "discord",
        description: {
          en: "Voice, video and text chat for communities",
          tr: "Topluluklar için ses, görüntü ve yazılı sohbet",
        },
      },
      {
        id: "whatsapp",
        name: "WhatsApp",
        wingetId: "9NKSQGP7F2NH",
        brewId: "whatsapp",
        source: "msstore",
        description: {
          en: "Meta's popular messaging app",
          tr: "Meta'nın popüler mesajlaşma uygulaması",
        },
      },
      {
        id: "telegram",
        name: "Telegram Desktop",
        wingetId: "Telegram.TelegramDesktop",
        brewId: "telegram",
        description: {
          en: "Fast, cloud-based messaging",
          tr: "Hızlı, bulut tabanlı mesajlaşma",
        },
      },
      {
        id: "signal",
        name: "Signal",
        wingetId: "OpenWhisperSystems.Signal",
        brewId: "signal",
        description: {
          en: "End-to-end encrypted private messaging",
          tr: "Uçtan uca şifreli özel mesajlaşma",
        },
      },
      {
        id: "zoom",
        name: "Zoom",
        wingetId: "Zoom.Zoom",
        brewId: "zoom",
        description: {
          en: "Video conferencing and online meetings",
          tr: "Video konferans ve çevrim içi toplantılar",
        },
      },
      {
        id: "teams",
        name: "Microsoft Teams",
        wingetId: "Microsoft.Teams",
        brewId: "microsoft-teams",
        description: {
          en: "Microsoft's collaboration and meeting hub",
          tr: "Microsoft'un iş birliği ve toplantı merkezi",
        },
      },
      {
        id: "slack",
        name: "Slack",
        wingetId: "SlackTechnologies.Slack",
        brewId: "slack",
        description: {
          en: "Team messaging and collaboration",
          tr: "Ekip mesajlaşması ve iş birliği",
        },
      },
      {
        id: "viber",
        name: "Viber",
        wingetId: "Rakuten.Viber",
        brewId: "viber",
        description: {
          en: "Free calls and messages",
          tr: "Ücretsiz arama ve mesajlaşma",
        },
      },
      {
        id: "teamspeak",
        name: "TeamSpeak 3",
        wingetId: "TeamSpeakSystems.TeamSpeakClient",
        brewId: "teamspeak-client",
        description: {
          en: "Low-latency voice chat for gaming",
          tr: "Oyun için düşük gecikmeli sesli sohbet",
        },
      },
      {
        id: "element",
        name: "Element",
        wingetId: "Element.Element",
        brewId: "element",
        description: {
          en: "Secure Matrix-based team chat",
          tr: "Matrix tabanlı güvenli ekip sohbeti",
        },
      },
      {
        id: "thunderbird",
        name: "Mozilla Thunderbird",
        wingetId: "Mozilla.Thunderbird",
        brewId: "thunderbird",
        description: {
          en: "Free email client with calendar",
          tr: "Takvimli ücretsiz e-posta istemcisi",
        },
      },
    ],
  },
  {
    key: "media",
    icon: Music,
    apps: [
      {
        id: "spotify",
        name: "Spotify",
        wingetId: "Spotify.Spotify",
        brewId: "spotify",
        description: {
          en: "Music and podcast streaming",
          tr: "Müzik ve podcast akışı",
        },
      },
      {
        id: "vlc",
        name: "VLC Media Player",
        wingetId: "VideoLAN.VLC",
        brewId: "vlc",
        description: {
          en: "Plays virtually every media format",
          tr: "Neredeyse her medya formatını oynatır",
        },
      },
      {
        id: "itunes",
        name: "iTunes",
        wingetId: "Apple.iTunes",
        description: {
          en: "Apple's media player and device sync",
          tr: "Apple medya oynatıcısı ve cihaz eşitleme",
        },
      },
      {
        id: "aimp",
        name: "AIMP",
        wingetId: "AIMP.AIMP",
        description: {
          en: "Lightweight music player with great audio",
          tr: "Hafif, yüksek ses kaliteli müzik çalar",
        },
      },
      {
        id: "musicbee",
        name: "MusicBee",
        wingetId: "MusicBee.MusicBee",
        description: {
          en: "Powerful music manager and player",
          tr: "Güçlü müzik yöneticisi ve oynatıcısı",
        },
      },
      {
        id: "foobar2000",
        name: "foobar2000",
        wingetId: "PeterPawlowski.foobar2000",
        brewId: "foobar2000",
        description: {
          en: "Minimal, highly customizable audio player",
          tr: "Sade, ileri düzey özelleştirilebilir müzik çalar",
        },
      },
      {
        id: "audacity",
        name: "Audacity",
        wingetId: "Audacity.Audacity",
        brewId: "audacity",
        description: {
          en: "Free audio recording and editing",
          tr: "Ücretsiz ses kaydı ve düzenleme",
        },
      },
      {
        id: "klite",
        name: "K-Lite Codec Pack",
        wingetId: "CodecGuide.K-LiteCodecPack.Standard",
        description: {
          en: "Codec bundle for broad media playback",
          tr: "Geniş medya desteği için codec paketi",
        },
      },
      {
        id: "mpc-hc",
        name: "MPC-HC",
        wingetId: "clsid2.mpc-hc",
        description: {
          en: "Classic lightweight video player",
          tr: "Klasik, hafif video oynatıcı",
        },
      },
      {
        id: "potplayer",
        name: "PotPlayer",
        wingetId: "Daum.PotPlayer",
        description: {
          en: "Feature-packed video player",
          tr: "Zengin özellikli video oynatıcı",
        },
      },
      {
        id: "kodi",
        name: "Kodi",
        wingetId: "XBMCFoundation.Kodi",
        brewId: "kodi",
        description: {
          en: "Open-source home theater center",
          tr: "Açık kaynaklı ev sineması merkezi",
        },
      },
      {
        id: "plex",
        name: "Plex Desktop",
        wingetId: "Plex.Plex",
        brewId: "plex",
        description: {
          en: "Stream your personal media library",
          tr: "Kişisel medya kitaplığınızı yayınlayın",
        },
      },
      {
        id: "stremio",
        name: "Stremio",
        wingetId: "Stremio.Stremio",
        brewId: "stremio",
        description: {
          en: "Media hub for movies and series",
          tr: "Film ve diziler için medya merkezi",
        },
      },
      {
        id: "jellyfin-player",
        name: "Jellyfin Media Player",
        wingetId: "Jellyfin.JellyfinMediaPlayer",
        brewId: "jellyfin-media-player",
        description: {
          en: "Client for the Jellyfin media server",
          tr: "Jellyfin medya sunucusu istemcisi",
        },
      },
      {
        id: "iina",
        name: "IINA",
        brewId: "iina",
        description: {
          en: "The modern media player for macOS",
          tr: "macOS için modern medya oynatıcı",
        },
      },
    ],
  },
  {
    key: "gaming",
    icon: Gamepad2,
    apps: [
      {
        id: "steam",
        name: "Steam",
        wingetId: "Valve.Steam",
        brewId: "steam",
        description: {
          en: "The largest PC game store and library",
          tr: "En büyük PC oyun mağazası ve kitaplığı",
        },
      },
      {
        id: "epic-games",
        name: "Epic Games Launcher",
        wingetId: "EpicGames.EpicGamesLauncher",
        brewId: "epic-games",
        description: {
          en: "Epic's store with weekly free games",
          tr: "Haftalık ücretsiz oyunlar sunan Epic mağazası",
        },
      },
      {
        id: "ea-app",
        name: "EA App",
        wingetId: "ElectronicArts.EADesktop",
        brewId: "ea",
        description: {
          en: "EA's game launcher (FIFA, Battlefield)",
          tr: "EA oyun başlatıcısı (FIFA, Battlefield)",
        },
      },
      {
        id: "ubisoft-connect",
        name: "Ubisoft Connect",
        wingetId: "Ubisoft.Connect",
        description: {
          en: "Ubisoft's launcher (Assassin's Creed)",
          tr: "Ubisoft başlatıcısı (Assassin's Creed)",
        },
      },
      {
        id: "gog-galaxy",
        name: "GOG Galaxy",
        wingetId: "GOG.Galaxy",
        brewId: "gog-galaxy",
        description: {
          en: "DRM-free game store and unified library",
          tr: "DRM'siz oyun mağazası ve birleşik kitaplık",
        },
      },
      {
        id: "battle-net",
        name: "Battle.net",
        wingetId: "Blizzard.BattleNet",
        brewId: "battle-net",
        description: {
          en: "Blizzard launcher (WoW, Diablo, CoD)",
          tr: "Blizzard başlatıcısı (WoW, Diablo, CoD)",
        },
      },
      {
        id: "rockstar",
        name: "Rockstar Games Launcher",
        wingetId: "RockstarGames.Launcher",
        description: {
          en: "Rockstar launcher (GTA, Red Dead)",
          tr: "Rockstar başlatıcısı (GTA, Red Dead)",
        },
      },
      {
        id: "valorant",
        name: "Valorant (EU)",
        wingetId: "RiotGames.Valorant.EU",
        description: {
          en: "Riot's tactical shooter, EU region",
          tr: "Riot'un taktiksel nişancı oyunu, EU bölgesi",
        },
      },
      {
        id: "lol",
        name: "League of Legends (TR)",
        wingetId: "RiotGames.LeagueOfLegends.TR",
        brewId: "league-of-legends",
        description: {
          en: "Riot's MOBA, Türkiye region",
          tr: "Riot'un MOBA oyunu, Türkiye bölgesi",
        },
      },
      {
        id: "geforce-now",
        name: "GeForce NOW",
        wingetId: "Nvidia.GeForceNow",
        brewId: "nvidia-geforce-now",
        description: {
          en: "NVIDIA's cloud gaming service",
          tr: "NVIDIA'nın bulut oyun servisi",
        },
      },
      {
        id: "playnite",
        name: "Playnite",
        wingetId: "Playnite.Playnite",
        description: {
          en: "Unified library for all your launchers",
          tr: "Tüm başlatıcılarınız için birleşik kitaplık",
        },
      },
      {
        id: "prism-launcher",
        name: "Prism Launcher",
        wingetId: "PrismLauncher.PrismLauncher",
        brewId: "prismlauncher",
        description: {
          en: "Minecraft launcher with modpack support",
          tr: "Mod paketi destekli Minecraft başlatıcısı",
        },
      },
      {
        id: "itch",
        name: "itch.io",
        wingetId: "ItchIo.Itch",
        brewId: "itch",
        description: {
          en: "Store and client for indie games",
          tr: "Bağımsız oyunlar için mağaza ve istemci",
        },
      },
      {
        id: "heroic",
        name: "Heroic Games Launcher",
        wingetId: "HeroicGamesLauncher.HeroicGamesLauncher",
        brewId: "heroic",
        description: {
          en: "Open-source Epic/GOG/Amazon client",
          tr: "Açık kaynaklı Epic/GOG/Amazon istemcisi",
        },
      },
      {
        id: "modrinth",
        name: "Modrinth App",
        wingetId: "Modrinth.ModrinthApp",
        brewId: "modrinth",
        description: {
          en: "Minecraft mod manager",
          tr: "Minecraft mod yöneticisi",
        },
      },
    ],
  },
  {
    key: "creation",
    icon: Video,
    apps: [
      {
        id: "obs",
        name: "OBS Studio",
        wingetId: "OBSProject.OBSStudio",
        brewId: "obs",
        description: {
          en: "Free streaming and screen recording",
          tr: "Ücretsiz yayın ve ekran kaydı",
        },
      },
      {
        id: "streamlabs",
        name: "Streamlabs Desktop",
        wingetId: "Streamlabs.Streamlabs",
        description: {
          en: "Streaming suite with built-in overlays",
          tr: "Hazır kaplamalı yayın paketi",
        },
      },
      {
        id: "sharex",
        name: "ShareX",
        wingetId: "ShareX.ShareX",
        description: {
          en: "Powerful screenshot and screen capture",
          tr: "Güçlü ekran görüntüsü ve kayıt aracı",
        },
      },
      {
        id: "lightshot",
        name: "Lightshot",
        wingetId: "Skillbrains.Lightshot",
        description: {
          en: "Quick and simple screenshots",
          tr: "Hızlı ve basit ekran görüntüsü",
        },
      },
      {
        id: "greenshot",
        name: "Greenshot",
        wingetId: "Greenshot.Greenshot",
        description: {
          en: "Screenshot tool with annotations",
          tr: "Açıklama eklemeli ekran görüntüsü aracı",
        },
      },
      {
        id: "gimp",
        name: "GIMP",
        wingetId: "GIMP.GIMP.3",
        brewId: "gimp",
        description: {
          en: "Free and open-source image editor",
          tr: "Ücretsiz, açık kaynaklı görsel düzenleyici",
        },
      },
      {
        id: "krita",
        name: "Krita",
        wingetId: "KDE.Krita",
        brewId: "krita",
        description: {
          en: "Digital painting and illustration",
          tr: "Dijital boyama ve illüstrasyon",
        },
      },
      {
        id: "inkscape",
        name: "Inkscape",
        wingetId: "Inkscape.Inkscape",
        brewId: "inkscape",
        description: {
          en: "Vector graphics editor (SVG)",
          tr: "Vektörel grafik düzenleyici (SVG)",
        },
      },
      {
        id: "paint-net",
        name: "Paint.NET",
        wingetId: "dotPDN.PaintDotNet",
        description: {
          en: "Simple yet capable image editing",
          tr: "Basit ama yetenekli görsel düzenleme",
        },
      },
      {
        id: "blender",
        name: "Blender",
        wingetId: "BlenderFoundation.Blender",
        brewId: "blender",
        description: {
          en: "3D modeling, animation and rendering",
          tr: "3B modelleme, animasyon ve render",
        },
      },
      {
        id: "handbrake",
        name: "HandBrake",
        wingetId: "HandBrake.HandBrake",
        brewId: "handbrake-app",
        description: {
          en: "Video transcoder and compressor",
          tr: "Video dönüştürücü ve sıkıştırıcı",
        },
      },
      {
        id: "shotcut",
        name: "Shotcut",
        wingetId: "Meltytech.Shotcut",
        brewId: "shotcut",
        description: {
          en: "Free cross-platform video editor",
          tr: "Ücretsiz, çok platformlu video düzenleyici",
        },
      },
      {
        id: "kdenlive",
        name: "Kdenlive",
        wingetId: "KDE.Kdenlive",
        brewId: "kdenlive",
        description: {
          en: "Open-source non-linear video editor",
          tr: "Açık kaynaklı video kurgu programı",
        },
      },
      {
        id: "capcut",
        name: "CapCut",
        wingetId: "ByteDance.CapCut",
        brewId: "capcut",
        description: {
          en: "Easy video editing for social media",
          tr: "Sosyal medya için kolay video düzenleme",
        },
      },
      {
        id: "irfanview",
        name: "IrfanView",
        wingetId: "IrfanSkiljan.IrfanView",
        description: {
          en: "Fast image viewer and converter",
          tr: "Hızlı görsel görüntüleyici ve dönüştürücü",
        },
      },
      {
        id: "imageglass",
        name: "ImageGlass",
        wingetId: "DuongDieuPhap.ImageGlass",
        description: {
          en: "Modern, lightweight image viewer",
          tr: "Modern, hafif görsel görüntüleyici",
        },
      },
      {
        id: "figma",
        name: "Figma",
        wingetId: "Figma.Figma",
        brewId: "figma",
        description: {
          en: "Collaborative interface design",
          tr: "İş birlikli arayüz tasarımı",
        },
      },
      {
        id: "canva",
        name: "Canva",
        wingetId: "Canva.Canva",
        brewId: "canva",
        description: {
          en: "Quick graphic design for everyone",
          tr: "Herkes için hızlı grafik tasarım",
        },
      },
    ],
  },
  {
    key: "office",
    icon: FileText,
    apps: [
      {
        id: "acrobat-reader",
        name: "Adobe Acrobat Reader",
        wingetId: "Adobe.Acrobat.Reader.64-bit",
        brewId: "adobe-acrobat-reader",
        description: {
          en: "The standard PDF viewer",
          tr: "Standart PDF görüntüleyici",
        },
      },
      {
        id: "libreoffice",
        name: "LibreOffice",
        wingetId: "TheDocumentFoundation.LibreOffice",
        brewId: "libreoffice",
        description: {
          en: "Free office suite (Writer, Calc, Impress)",
          tr: "Ücretsiz ofis paketi (Writer, Calc, Impress)",
        },
      },
      {
        id: "onlyoffice",
        name: "ONLYOFFICE Desktop",
        wingetId: "ONLYOFFICE.DesktopEditors",
        brewId: "onlyoffice",
        description: {
          en: "Office suite with high MS compatibility",
          tr: "Yüksek MS uyumlu ofis paketi",
        },
      },
      {
        id: "sumatra",
        name: "SumatraPDF",
        wingetId: "SumatraPDF.SumatraPDF",
        description: {
          en: "Ultra-light PDF and ebook reader",
          tr: "Çok hafif PDF ve e-kitap okuyucu",
        },
      },
      {
        id: "foxit",
        name: "Foxit PDF Reader",
        wingetId: "Foxit.FoxitReader",
        description: {
          en: "Fast PDF reader with annotations",
          tr: "Açıklama destekli hızlı PDF okuyucu",
        },
      },
      {
        id: "notion",
        name: "Notion",
        wingetId: "Notion.Notion",
        brewId: "notion",
        description: {
          en: "All-in-one notes and project workspace",
          tr: "Hepsi bir arada not ve proje alanı",
        },
      },
      {
        id: "obsidian",
        name: "Obsidian",
        wingetId: "Obsidian.Obsidian",
        brewId: "obsidian",
        description: {
          en: "Markdown knowledge base with links",
          tr: "Bağlantılı Markdown bilgi tabanı",
        },
      },
      {
        id: "evernote",
        name: "Evernote",
        wingetId: "evernote.evernote",
        brewId: "evernote",
        description: {
          en: "Note taking and organization",
          tr: "Not alma ve düzenleme",
        },
      },
      {
        id: "anki",
        name: "Anki",
        wingetId: "Anki.Anki",
        brewId: "anki",
        description: {
          en: "Spaced-repetition flashcards",
          tr: "Aralıklı tekrar kartlarıyla öğrenme",
        },
      },
      {
        id: "calibre",
        name: "Calibre",
        wingetId: "calibre.calibre",
        brewId: "calibre",
        description: {
          en: "Ebook library manager and converter",
          tr: "E-kitap kitaplığı yöneticisi ve dönüştürücü",
        },
      },
      {
        id: "naps2",
        name: "NAPS2",
        wingetId: "Cyanfish.NAPS2",
        brewId: "naps2",
        description: {
          en: "Document scanning to PDF",
          tr: "PDF'e belge tarama",
        },
      },
    ],
  },
  {
    key: "development",
    icon: Code2,
    apps: [
      {
        id: "vscode",
        name: "Visual Studio Code",
        wingetId: "Microsoft.VisualStudioCode",
        brewId: "visual-studio-code",
        description: {
          en: "The most popular code editor",
          tr: "En popüler kod düzenleyici",
        },
      },
      {
        id: "vscodium",
        name: "VSCodium",
        wingetId: "VSCodium.VSCodium",
        brewId: "vscodium",
        description: {
          en: "Telemetry-free VS Code build",
          tr: "Telemetrisiz VS Code sürümü",
        },
      },
      {
        id: "cursor",
        name: "Cursor",
        wingetId: "Anysphere.Cursor",
        brewId: "cursor",
        description: {
          en: "AI-first code editor",
          tr: "Yapay zekâ odaklı kod düzenleyici",
        },
      },
      {
        id: "git",
        name: "Git",
        wingetId: "Git.Git",
        description: {
          en: "The version control system",
          tr: "Sürüm kontrol sistemi",
        },
      },
      {
        id: "github-desktop",
        name: "GitHub Desktop",
        wingetId: "GitHub.GitHubDesktop",
        brewId: "github",
        description: {
          en: "GUI for GitHub repositories",
          tr: "GitHub depoları için arayüz",
        },
      },
      {
        id: "python",
        name: "Python 3",
        wingetId: "Python.Python.3.14",
        description: {
          en: "Python programming language",
          tr: "Python programlama dili",
        },
      },
      {
        id: "nodejs",
        name: "Node.js LTS",
        wingetId: "OpenJS.NodeJS.LTS",
        description: {
          en: "JavaScript runtime, LTS release",
          tr: "JavaScript çalışma ortamı, LTS sürümü",
        },
      },
      {
        id: "docker",
        name: "Docker Desktop",
        wingetId: "Docker.DockerDesktop",
        brewId: "docker-desktop",
        description: {
          en: "Containers on your desktop",
          tr: "Masaüstünde konteyner yönetimi",
        },
      },
      {
        id: "postman",
        name: "Postman",
        wingetId: "Postman.Postman",
        brewId: "postman",
        description: {
          en: "API development and testing",
          tr: "API geliştirme ve test",
        },
      },
      {
        id: "jetbrains-toolbox",
        name: "JetBrains Toolbox",
        wingetId: "JetBrains.Toolbox",
        brewId: "jetbrains-toolbox",
        description: {
          en: "Manage JetBrains IDEs",
          tr: "JetBrains IDE'lerini yönetin",
        },
      },
      {
        id: "sublime",
        name: "Sublime Text 4",
        wingetId: "SublimeHQ.SublimeText.4",
        brewId: "sublime-text",
        description: {
          en: "Fast, lightweight text editor",
          tr: "Hızlı, hafif metin düzenleyici",
        },
      },
      {
        id: "notepadpp",
        name: "Notepad++",
        wingetId: "Notepad++.Notepad++",
        description: {
          en: "Classic lightweight code/text editor",
          tr: "Klasik, hafif kod/metin düzenleyici",
        },
      },
      {
        id: "windows-terminal",
        name: "Windows Terminal",
        wingetId: "Microsoft.WindowsTerminal",
        description: {
          en: "Modern tabbed terminal",
          tr: "Modern sekmeli terminal",
        },
      },
      {
        id: "powershell",
        name: "PowerShell 7",
        wingetId: "Microsoft.PowerShell",
        description: {
          en: "Cross-platform PowerShell",
          tr: "Çok platformlu PowerShell",
        },
      },
      {
        id: "visual-studio",
        name: "Visual Studio 2022 Community",
        wingetId: "Microsoft.VisualStudio.2022.Community",
        description: {
          en: "Full IDE for .NET and C++",
          tr: ".NET ve C++ için tam IDE",
        },
      },
      {
        id: "filezilla",
        name: "FileZilla",
        wingetId: "TimKosse.FileZilla.Client",
        description: {
          en: "FTP/SFTP file transfer client",
          tr: "FTP/SFTP dosya aktarım istemcisi",
        },
      },
      {
        id: "putty",
        name: "PuTTY",
        wingetId: "PuTTY.PuTTY",
        description: {
          en: "SSH and telnet client",
          tr: "SSH ve telnet istemcisi",
        },
      },
      {
        id: "winscp",
        name: "WinSCP",
        wingetId: "WinSCP.WinSCP",
        description: {
          en: "SFTP/SCP client with GUI",
          tr: "Arayüzlü SFTP/SCP istemcisi",
        },
      },
      {
        id: "cmake",
        name: "CMake",
        wingetId: "Kitware.CMake",
        brewId: "cmake-app",
        description: {
          en: "C/C++ build system generator",
          tr: "C/C++ derleme sistemi üreteci",
        },
      },
      {
        id: "go",
        name: "Go",
        wingetId: "GoLang.Go",
        description: {
          en: "Go programming language",
          tr: "Go programlama dili",
        },
      },
      {
        id: "rust",
        name: "Rust (MSVC)",
        wingetId: "Rustlang.Rust.MSVC",
        description: {
          en: "Rust programming language",
          tr: "Rust programlama dili",
        },
      },
      {
        id: "iterm2",
        name: "iTerm2",
        brewId: "iterm2",
        description: {
          en: "Powerful terminal for macOS",
          tr: "macOS için güçlü terminal",
        },
      },
    ],
  },
  {
    key: "utilities",
    icon: Wrench,
    apps: [
      {
        id: "7zip",
        name: "7-Zip",
        wingetId: "7zip.7zip",
        description: {
          en: "Free, high-ratio file archiver",
          tr: "Ücretsiz, yüksek oranlı arşivleyici",
        },
      },
      {
        id: "winrar",
        name: "WinRAR",
        wingetId: "RARLab.WinRAR",
        description: {
          en: "The classic RAR/ZIP archiver",
          tr: "Klasik RAR/ZIP arşivleyici",
        },
      },
      {
        id: "nanazip",
        name: "NanaZip",
        wingetId: "M2Team.NanaZip",
        description: {
          en: "Modern 7-Zip fork for Windows 11",
          tr: "Windows 11 için modern 7-Zip türevi",
        },
      },
      {
        id: "powertoys",
        name: "Microsoft PowerToys",
        wingetId: "Microsoft.PowerToys",
        description: {
          en: "Power-user utilities from Microsoft",
          tr: "Microsoft'tan ileri kullanıcı araçları",
        },
      },
      {
        id: "everything",
        name: "Everything",
        wingetId: "voidtools.Everything",
        description: {
          en: "Instant file search across drives",
          tr: "Diskler arası anında dosya arama",
        },
      },
      {
        id: "treesize",
        name: "TreeSize Free",
        wingetId: "JAMSoftware.TreeSize.Free",
        description: {
          en: "Visualize disk space usage",
          tr: "Disk alanı kullanımını görselleştirin",
        },
      },
      {
        id: "wiztree",
        name: "WizTree",
        wingetId: "AntibodySoftware.WizTree",
        description: {
          en: "Fastest disk space analyzer",
          tr: "En hızlı disk alanı analizcisi",
        },
      },
      {
        id: "rufus",
        name: "Rufus",
        wingetId: "Rufus.Rufus",
        description: {
          en: "Create bootable USB drives",
          tr: "Önyüklenebilir USB oluşturma",
        },
      },
      {
        id: "ventoy",
        name: "Ventoy",
        wingetId: "Ventoy.Ventoy",
        description: {
          en: "Multi-ISO bootable USB tool",
          tr: "Çoklu ISO önyüklenebilir USB aracı",
        },
      },
      {
        id: "revo",
        name: "Revo Uninstaller",
        wingetId: "RevoUninstaller.RevoUninstaller",
        description: {
          en: "Deep uninstall with leftovers cleanup",
          tr: "Kalıntı temizlemeli derin kaldırma",
        },
      },
      {
        id: "bcu",
        name: "Bulk Crap Uninstaller",
        wingetId: "Klocman.BulkCrapUninstaller",
        description: {
          en: "Batch uninstall unwanted programs",
          tr: "İstenmeyen programları toplu kaldırma",
        },
      },
      {
        id: "ccleaner",
        name: "CCleaner",
        wingetId: "Piriform.CCleaner",
        description: {
          en: "System cleaning and optimization",
          tr: "Sistem temizleme ve optimizasyon",
        },
      },
      {
        id: "qbittorrent",
        name: "qBittorrent",
        wingetId: "qBittorrent.qBittorrent",
        brewId: "qbittorrent",
        description: {
          en: "Ad-free open-source torrent client",
          tr: "Reklamsız açık kaynak torrent istemcisi",
        },
      },
      {
        id: "jdownloader",
        name: "JDownloader",
        wingetId: "AppWork.JDownloader",
        brewId: "jdownloader",
        description: {
          en: "Download manager for file hosts",
          tr: "Dosya barındırıcıları için indirme yöneticisi",
        },
      },
      {
        id: "idm",
        name: "Internet Download Manager",
        wingetId: "Tonec.InternetDownloadManager",
        description: {
          en: "Accelerated download manager (trial)",
          tr: "Hızlandırılmış indirme yöneticisi (deneme)",
        },
      },
      {
        id: "teamviewer",
        name: "TeamViewer",
        wingetId: "TeamViewer.TeamViewer",
        brewId: "teamviewer",
        description: {
          en: "Remote desktop and support",
          tr: "Uzak masaüstü ve destek",
        },
      },
      {
        id: "anydesk",
        name: "AnyDesk",
        wingetId: "AnyDesk.AnyDesk",
        brewId: "anydesk",
        description: {
          en: "Fast remote desktop",
          tr: "Hızlı uzak masaüstü",
        },
      },
      {
        id: "rustdesk",
        name: "RustDesk",
        wingetId: "RustDesk.RustDesk",
        brewId: "rustdesk",
        description: {
          en: "Open-source remote desktop",
          tr: "Açık kaynaklı uzak masaüstü",
        },
      },
      {
        id: "parsec",
        name: "Parsec",
        wingetId: "Parsec.Parsec",
        brewId: "parsec",
        description: {
          en: "Low-latency remote play and desktop",
          tr: "Düşük gecikmeli uzak oyun ve masaüstü",
        },
      },
      {
        id: "dropbox",
        name: "Dropbox",
        wingetId: "Dropbox.Dropbox",
        brewId: "dropbox",
        description: {
          en: "Cloud file sync and sharing",
          tr: "Bulut dosya eşitleme ve paylaşım",
        },
      },
      {
        id: "google-drive",
        name: "Google Drive",
        wingetId: "Google.GoogleDrive",
        brewId: "google-drive",
        description: {
          en: "Google's cloud storage client",
          tr: "Google bulut depolama istemcisi",
        },
      },
      {
        id: "localsend",
        name: "LocalSend",
        wingetId: "LocalSend.LocalSend",
        brewId: "localsend",
        description: {
          en: "AirDrop-like local file sharing",
          tr: "AirDrop benzeri yerel dosya paylaşımı",
        },
      },
      {
        id: "flux",
        name: "f.lux",
        wingetId: "flux.flux",
        description: {
          en: "Adjusts screen color by time of day",
          tr: "Ekran rengini saate göre ayarlar",
        },
      },
      {
        id: "translucenttb",
        name: "TranslucentTB",
        wingetId: "CharlesMilette.TranslucentTB",
        description: {
          en: "Transparent Windows taskbar",
          tr: "Şeffaf Windows görev çubuğu",
        },
      },
      {
        id: "eartrumpet",
        name: "EarTrumpet",
        wingetId: "File-New-Project.EarTrumpet",
        description: {
          en: "Per-app volume control",
          tr: "Uygulama bazlı ses kontrolü",
        },
      },
      {
        id: "autohotkey",
        name: "AutoHotkey",
        wingetId: "AutoHotkey.AutoHotkey",
        description: {
          en: "Automation and hotkey scripting",
          tr: "Otomasyon ve kısayol betikleri",
        },
      },
      {
        id: "virtualbox",
        name: "Oracle VirtualBox",
        wingetId: "Oracle.VirtualBox",
        brewId: "virtualbox",
        description: {
          en: "Free virtual machine software",
          tr: "Ücretsiz sanal makine yazılımı",
        },
      },
      {
        id: "etcher",
        name: "balenaEtcher",
        wingetId: "Balena.Etcher",
        brewId: "balenaetcher",
        description: {
          en: "Flash OS images to USB drives",
          tr: "USB'ye işletim sistemi imajı yazma",
        },
      },
      {
        id: "keka",
        name: "Keka",
        brewId: "keka",
        description: {
          en: "macOS file archiver (7z, RAR, ZIP)",
          tr: "macOS dosya arşivleyici (7z, RAR, ZIP)",
        },
      },
      {
        id: "the-unarchiver",
        name: "The Unarchiver",
        brewId: "the-unarchiver",
        description: {
          en: "Extracts any archive format on macOS",
          tr: "macOS'ta her arşiv formatını açar",
        },
      },
      {
        id: "raycast",
        name: "Raycast",
        brewId: "raycast",
        description: {
          en: "Blazing fast launcher for macOS",
          tr: "macOS için çok hızlı başlatıcı",
        },
      },
      {
        id: "rectangle",
        name: "Rectangle",
        brewId: "rectangle",
        description: {
          en: "Window snapping for macOS",
          tr: "macOS için pencere hizalama",
        },
      },
      {
        id: "appcleaner",
        name: "AppCleaner",
        brewId: "appcleaner",
        description: {
          en: "Thoroughly uninstall macOS apps",
          tr: "macOS uygulamalarını kalıntısız kaldırma",
        },
      },
    ],
  },
  {
    key: "hardware",
    icon: Gauge,
    apps: [
      {
        id: "cpu-z",
        name: "CPU-Z",
        wingetId: "CPUID.CPU-Z",
        description: {
          en: "Detailed CPU and memory info",
          tr: "Ayrıntılı işlemci ve bellek bilgisi",
        },
      },
      {
        id: "gpu-z",
        name: "GPU-Z",
        wingetId: "TechPowerUp.GPU-Z",
        description: {
          en: "Detailed graphics card info",
          tr: "Ayrıntılı ekran kartı bilgisi",
        },
      },
      {
        id: "hwinfo",
        name: "HWiNFO",
        wingetId: "REALiX.HWiNFO",
        description: {
          en: "In-depth hardware monitoring",
          tr: "Derinlemesine donanım izleme",
        },
      },
      {
        id: "hwmonitor",
        name: "HWMonitor",
        wingetId: "CPUID.HWMonitor",
        description: {
          en: "Temperatures, voltages and fans",
          tr: "Sıcaklık, voltaj ve fan izleme",
        },
      },
      {
        id: "msi-afterburner",
        name: "MSI Afterburner",
        wingetId: "Guru3D.Afterburner",
        description: {
          en: "GPU overclocking and OSD",
          tr: "GPU hız aşırtma ve ekran göstergesi",
        },
      },
      {
        id: "crystaldiskinfo",
        name: "CrystalDiskInfo",
        wingetId: "CrystalDewWorld.CrystalDiskInfo",
        description: {
          en: "Disk health and S.M.A.R.T. status",
          tr: "Disk sağlığı ve S.M.A.R.T. durumu",
        },
      },
      {
        id: "crystaldiskmark",
        name: "CrystalDiskMark",
        wingetId: "CrystalDewWorld.CrystalDiskMark",
        description: {
          en: "Disk speed benchmark",
          tr: "Disk hız testi",
        },
      },
      {
        id: "cinebench",
        name: "Cinebench R23",
        wingetId: "Maxon.CinebenchR23",
        description: {
          en: "CPU rendering benchmark",
          tr: "İşlemci render testi",
        },
      },
      {
        id: "fancontrol",
        name: "FanControl",
        wingetId: "Rem0o.FanControl",
        description: {
          en: "Custom fan curves for all sensors",
          tr: "Tüm sensörler için özel fan eğrileri",
        },
      },
      {
        id: "openrgb",
        name: "OpenRGB",
        wingetId: "OpenRGB.OpenRGB",
        description: {
          en: "Unified RGB lighting control",
          tr: "Birleşik RGB aydınlatma kontrolü",
        },
      },
      {
        id: "signalrgb",
        name: "SignalRGB",
        wingetId: "WhirlwindFX.SignalRgb",
        description: {
          en: "RGB effects across brands",
          tr: "Markalar arası RGB efektleri",
        },
      },
      {
        id: "ddu",
        name: "Display Driver Uninstaller",
        wingetId: "Wagnardsoft.DisplayDriverUninstaller",
        description: {
          en: "Clean GPU driver removal",
          tr: "Temiz GPU sürücüsü kaldırma",
        },
      },
      {
        id: "nvcleanstall",
        name: "NVCleanstall",
        wingetId: "TechPowerUp.NVCleanstall",
        description: {
          en: "Customized NVIDIA driver install",
          tr: "Özelleştirilmiş NVIDIA sürücü kurulumu",
        },
      },
      {
        id: "sdio",
        name: "Snappy Driver Installer Origin",
        wingetId: "GlennDelahoy.SnappyDriverInstallerOrigin",
        description: {
          en: "Offline bulk driver installer",
          tr: "Çevrim dışı toplu sürücü yükleyici",
        },
      },
      {
        id: "stats",
        name: "Stats",
        brewId: "stats",
        description: {
          en: "System monitor in the macOS menu bar",
          tr: "macOS menü çubuğunda sistem monitörü",
        },
      },
    ],
  },
  {
    key: "security",
    icon: Shield,
    apps: [
      {
        id: "malwarebytes",
        name: "Malwarebytes",
        wingetId: "Malwarebytes.Malwarebytes",
        brewId: "malwarebytes",
        description: {
          en: "Anti-malware scanning and protection",
          tr: "Kötü amaçlı yazılım taraması ve koruma",
        },
      },
      {
        id: "bitwarden",
        name: "Bitwarden",
        wingetId: "Bitwarden.Bitwarden",
        brewId: "bitwarden",
        description: {
          en: "Open-source password manager",
          tr: "Açık kaynaklı parola yöneticisi",
        },
      },
      {
        id: "keepassxc",
        name: "KeePassXC",
        wingetId: "KeePassXCTeam.KeePassXC",
        brewId: "keepassxc",
        description: {
          en: "Offline password database",
          tr: "Çevrim dışı parola veritabanı",
        },
      },
      {
        id: "1password",
        name: "1Password",
        wingetId: "AgileBits.1Password",
        brewId: "1password",
        description: {
          en: "Premium password manager",
          tr: "Premium parola yöneticisi",
        },
      },
      {
        id: "proton-pass",
        name: "Proton Pass",
        wingetId: "Proton.ProtonPass",
        brewId: "proton-pass",
        description: {
          en: "Encrypted password manager from Proton",
          tr: "Proton'dan şifreli parola yöneticisi",
        },
      },
      {
        id: "protonvpn",
        name: "Proton VPN",
        wingetId: "Proton.ProtonVPN",
        brewId: "protonvpn",
        description: {
          en: "Privacy-first VPN with free tier",
          tr: "Ücretsiz katmanlı, gizlilik odaklı VPN",
        },
      },
      {
        id: "nordvpn",
        name: "NordVPN",
        wingetId: "NordSecurity.NordVPN",
        brewId: "nordvpn",
        description: {
          en: "Popular commercial VPN",
          tr: "Popüler ticari VPN",
        },
      },
      {
        id: "mullvad",
        name: "Mullvad VPN",
        wingetId: "MullvadVPN.MullvadVPN",
        brewId: "mullvad-vpn",
        description: {
          en: "Anonymous, account-free VPN",
          tr: "Anonim, hesap gerektirmeyen VPN",
        },
      },
      {
        id: "wireguard",
        name: "WireGuard",
        wingetId: "WireGuard.WireGuard",
        description: {
          en: "Modern VPN tunnel client",
          tr: "Modern VPN tünel istemcisi",
        },
      },
      {
        id: "openvpn",
        name: "OpenVPN Connect",
        wingetId: "OpenVPNTechnologies.OpenVPNConnect",
        brewId: "openvpn-connect",
        description: {
          en: "Official OpenVPN client",
          tr: "Resmî OpenVPN istemcisi",
        },
      },
      {
        id: "cloudflare-warp",
        name: "Cloudflare WARP",
        wingetId: "Cloudflare.Warp",
        brewId: "cloudflare-warp",
        description: {
          en: "1.1.1.1 secure DNS and VPN",
          tr: "1.1.1.1 güvenli DNS ve VPN",
        },
      },
    ],
  },
  {
    key: "runtimes",
    icon: Package,
    apps: [
      {
        id: "vcredist-x64",
        name: "Visual C++ 2015-2022 (x64)",
        wingetId: "Microsoft.VCRedist.2015+.x64",
        description: {
          en: "Required by most games and apps",
          tr: "Çoğu oyun ve uygulama için gerekli",
        },
      },
      {
        id: "vcredist-x86",
        name: "Visual C++ 2015-2022 (x86)",
        wingetId: "Microsoft.VCRedist.2015+.x86",
        description: {
          en: "32-bit Visual C++ runtime",
          tr: "32-bit Visual C++ çalışma zamanı",
        },
      },
      {
        id: "dotnet8",
        name: ".NET Desktop Runtime 8",
        wingetId: "Microsoft.DotNet.DesktopRuntime.8",
        description: {
          en: "Runtime for .NET desktop apps",
          tr: ".NET masaüstü uygulamaları için çalışma zamanı",
        },
      },
      {
        id: "dotnet6",
        name: ".NET Desktop Runtime 6",
        wingetId: "Microsoft.DotNet.DesktopRuntime.6",
        description: {
          en: "Legacy .NET 6 runtime",
          tr: "Eski .NET 6 çalışma zamanı",
        },
      },
      {
        id: "directx",
        name: "DirectX End-User Runtime",
        wingetId: "Microsoft.DirectX",
        description: {
          en: "Legacy DirectX libraries for old games",
          tr: "Eski oyunlar için DirectX kitaplıkları",
        },
      },
      {
        id: "java8",
        name: "Java Runtime Environment 8",
        wingetId: "Oracle.JavaRuntimeEnvironment",
        description: {
          en: "Oracle Java 8 runtime",
          tr: "Oracle Java 8 çalışma zamanı",
        },
      },
      {
        id: "temurin21",
        name: "Eclipse Temurin JRE 21",
        wingetId: "EclipseAdoptium.Temurin.21.JRE",
        brewId: "temurin@21",
        description: {
          en: "Open-source Java 21 runtime",
          tr: "Açık kaynaklı Java 21 çalışma zamanı",
        },
      },
      {
        id: "webview2",
        name: "Microsoft WebView2 Runtime",
        wingetId: "Microsoft.EdgeWebView2Runtime",
        description: {
          en: "Web engine used by modern desktop apps",
          tr: "Modern masaüstü uygulamalarının web motoru",
        },
      },
    ],
  },
];

export const allCatalogApps: CatalogApp[] = appCatalog.flatMap((c) => c.apps);

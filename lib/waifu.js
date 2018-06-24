const log = require("./log")
const rand = require("pandemonium")
const names = require("fantasy-names")

let virtue = [
  "Loves to cook for you",
  "Intellegent",
  "Physically fit",
  "Artist",
  "Cosplayer",
  "Virgin",
  "Romantic",
  "Submissive",
  "Idol",
  "Rich",
  "Shapeshifter",
  "Blue Blood",
  "Optimistic",
  "Loves to roleplay",
  "Wizzard skills",
  "Shy",
  "Big Breasts",
  "Super Overhemly Big Breasts",
  "Big Butt",
  "Will never leave you",
  "Nudist",
  "Maid",
  "Esper",
  "Videoblogger",
  "Karate Black Belt",
  "Ninja",
  "Programmer",
  "Armor",
  "Horny"
]

let weaks = [
  "Smokes",
  "Drinks",
  "Drugs",
  "a lot of phobias",
  "10+ partners before",
  "Orphan",
  "Will cheat on you",
  "Disabled",
  "Jealous",
  "Awful character",
  "Criminal",
  "PTSD",
  "Army Veteran",
  "Permanently Unemployed",
  "Hairy",
  "Masochistic",
  "Sadistic",
  "Tsundere",
  "Antisocial",
  "Yandere",
  "Attentionwhore",
  "Depressive",
  "Vampire",
  "Incureable Disease",
  "Baka"
]

let races = [
  "Caucasian-Human",
  "Asian-Human",
  "Afro-Human",
  "Elf",
  "Dark-Elf",
  "High-Elf",
  "half-Orc",
  "Oni",
  "Half-Dworf",
  "Demon",
  "Nekogirl",
  "Cowgirl",
  "Bunnygirl",
  "Dragongirl",
  "Wolfgirl",
  "Shmokagirl",
  "Slimegirl",
  "Cybergirl",
  "Куколка_Муровья(InsectGirl)"
]

let nameGroups = [
  { g: "real", t: "japaneses" },
  { g: "real", t: "gothics" },
  { g: "real", t: "frenchs" },
  { g: "real", t: "germans" },
  { g: "real", t: "jewishs" },
  { g: "real", t: "englishs" }
]

let quirks = virtue.concat(weaks)

//base

function generate() {
  let totalRaces = rand.random(1, 2)
  let preAge = rand.choice([[16, 18], [16, 21], [16, 33], [16, 45], [16, 2000]])
  let nameGroup = rand.choice(nameGroups)
  let totalQuirks = rand.random(4, 5)

  let waifu = {}
  waifu.name = names(nameGroup.g, nameGroup.t, 1, 1)
  waifu.age = rand.random(preAge[0], preAge[1])
  waifu.height = rand.random(140, 200)
  waifu.quirks = []
  while (waifu.quirks.length < totalQuirks) {
    let quirk = rand.choice(quirks)
    if (!waifu.quirks.includes(quirk)) waifu.quirks.push(quirk)
  }

  waifu.races = []
  while (waifu.races.length < totalRaces) {
    let race = rand.choice(races)
    if (!waifu.races.includes(race)) waifu.races.push(race)
  }

  waifu.quirks = waifu.quirks.sort()

  return waifu
}

exports.generate = generate

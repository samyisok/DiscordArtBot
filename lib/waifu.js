const log = require("./log")
const rand = require("pandemonium")
const names = require("fantasy-names")

let virtue = [
  "Loves to cook for you",
  "Intelegent",
  "Physically fit",
  "Artist",
  "Cosplayer",
  "Is a Virgin",
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
  "Big Butt",
  "Will never leave you",
  "Nudist"
]

let weaks = [
  "Smokes",
  "Drinks",
  "Bullies You",
  "Does Drugs",
  "Has a lot of phobias",
  "Had 10+ partners before",
  "Orphan",
  "Can cheat on you",
  "Disabled",
  "Jealous",
  "Awful character",
  "Criminal",
  "Has kids",
  "Has PTSD",
  "Was in Army",
  "Permanently Unemployed",
  "Worked as a prostitute",
  "Does not shave",
  "Masochistic",
  "Sadistic",
  "Tsundere",
  "Antisocial",
  "Yandere",
  "Attentionwhore",
  "Trap",
  "Depressive"
]

let races = [
  "Caucasian-Human",
  "Asian-Human",
  "Afro-Human",
  "Elf",
  "Dark-Elf",
  "High-Elf",
  "Half-Orc",
  "Half-Elf",
  "Oni",
  "Half-Oni",
  "Dworf",
  "Demon",
  "Half-Demon",
  "Nekogirl",
  "Cowgirl",
  "Bunnygirl",
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
  let preAge = rand.choice([[16, 21], [16, 33], [16, 45], [16, 2000]])
  let nameGroup = rand.choice(nameGroups)
  let totalQuirks = rand.random(3, 7)

  let waifu = {}
  waifu.name = names(nameGroup.g, nameGroup.t, 1, 1)
  waifu.age = rand.random(preAge[0], preAge[1])
  waifu.height = rand.random(140, 210)
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

  return waifu
}

exports.generate = generate

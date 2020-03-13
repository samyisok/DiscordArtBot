const log = require("./log")
const rand = require("pandemonium")
const names = require("fantasy-names")

let virtue = [
  "Master of Cooking",
  "Alchemist",
  "Intellegent",
  "Physically fit",
  "Artist",
  "Cosplayer",
  "Virgin",
  "Romantic",
  "Submissive",
  "Idol",
  "Rich",
  "Zoologist",
  "Game-Developer",
  "Shapeshifter",
  "Blue Blood",
  "Optimistic",
  "Loves to roleplay",
  "Wizzard skills",
  "Shy",
  "Big Breasts",
  "Super Overhemly Big Breasts",
  "Big Butt",
  "Nudist",
  "Maid",
  "Witch",
  "Esper",
  "Videoblogger",
  "Karate Black Belt",
  "Ninja",
  "Programmer",
  "Office Worker",
  "Armor",
  "Horny",
  "Can see through clothes",
  "Can detect contents by licking",
  "Socialist",
  "Have a Donut",
  "Super-Strength",
  "Super-Eating",
  "Can manipulate Qi",
  "Brain Calculator",
  "Timetraveler"
]

let weaks = [
  "Smokes",
  "Drinks",
  "Drugs",
  "A lot of phobias",
  "Orphan",
  "Con Artist",
  "Disabled",
  "Jealous",
  "Awful character",
  "Criminal",
  "PTSD",
  "Army Veteran",
  "Mutant",
  "Permanently Unemployed",
  "Hairy",
  "Masochistic",
  "Sadistic",
  "Tsundere",
  "Antisocial",
  "Yandere",
  "Attentionwhore",
  "Your BOSS",
  "Depressive",
  "Yakuza",
  "Vampire",
  "Baka",
  "Incureable Disease",
  "Skeleton",
  "CEO",
  "Communist",
  "From Space",
  "Can eat only rocks"
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
  "Horsegirl",
  "Mushroomgirl",
  "Octopusgirl",
  "Куколка_Муровья"
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
  let preAge = rand.choice([[16, 18], [16, 21], [16, 33], [16, 45], [16, 2000],[2000, 99999]])
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

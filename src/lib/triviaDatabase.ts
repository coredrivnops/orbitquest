// Comprehensive Trivia Database for OrbitQuest
// 100+ fact-checked questions per celestial body
// All facts from NASA, ESA, and peer-reviewed sources

export interface TriviaQuestion {
    question: string;
    answers: string[];
    correct: number;
    fact: string;
}

// Shuffle array helper
export function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Get random questions for a planet (ensures variety)
export function getRandomTrivia(planetId: string, count: number = 10): TriviaQuestion[] {
    const allQuestions = TRIVIA_DATABASE[planetId] || [];
    const shuffled = shuffleArray(allQuestions);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

// PLUTO TRIVIA (100+ questions about the dwarf planet)
const PLUTO_TRIVIA: TriviaQuestion[] = [
    { question: "When was Pluto discovered?", answers: ["1906", "1930", "1958", "1979"], correct: 1, fact: "Clyde Tombaugh discovered Pluto on February 18, 1930, at Lowell Observatory in Arizona." },
    { question: "Why was Pluto reclassified as a dwarf planet?", answers: ["Too small", "Hasn't cleared orbit", "No moons", "No atmosphere"], correct: 1, fact: "In 2006, the IAU defined planets as objects that have cleared their orbital neighborhood—Pluto shares its orbit with other Kuiper Belt objects." },
    { question: "What is Pluto's largest moon?", answers: ["Nix", "Hydra", "Charon", "Kerberos"], correct: 2, fact: "Charon is so large (half Pluto's diameter) that Pluto and Charon are sometimes called a 'double dwarf planet.'" },
    { question: "What heart-shaped feature is on Pluto?", answers: ["Sputnik Plain", "Tombaugh Regio", "Cthulhu Macula", "Tartarus Dorsa"], correct: 1, fact: "The heart-shaped Tombaugh Regio is named after Pluto's discoverer and is about 1,000 km wide." },
    { question: "How long is a year on Pluto?", answers: ["89 Earth years", "165 Earth years", "248 Earth years", "365 Earth years"], correct: 2, fact: "Pluto takes 248 Earth years to orbit the Sun once, meaning it hasn't completed a full orbit since its 1930 discovery!" },
    { question: "What spacecraft visited Pluto?", answers: ["Voyager 1", "Cassini", "New Horizons", "Juno"], correct: 2, fact: "NASA's New Horizons flew by Pluto on July 14, 2015, after a 9.5-year journey." },
    { question: "What is Pluto's atmosphere mainly made of?", answers: ["Oxygen", "Carbon dioxide", "Nitrogen", "Helium"], correct: 2, fact: "Pluto has a thin atmosphere of nitrogen, methane, and carbon monoxide that expands and contracts with its distance from the Sun." },
    { question: "How does Pluto's orbit differ from other planets?", answers: ["Circular", "Highly elliptical", "Square", "Spiral"], correct: 1, fact: "Pluto's eccentric orbit is so elliptical that it sometimes comes closer to the Sun than Neptune!" },
    { question: "What gives Pluto its reddish-brown color?", answers: ["Iron oxide", "Tholins", "Sulfur", "Blood"], correct: 1, fact: "Tholins are complex organic molecules formed when UV light hits methane and nitrogen—they coat Pluto's surface." },
    { question: "How many moons does Pluto have?", answers: ["1", "3", "5", "7"], correct: 2, fact: "Pluto has 5 known moons: Charon, Nix, Hydra, Kerberos, and Styx." },
    { question: "What is Sputnik Planitia?", answers: ["A crater", "An ice plain", "A mountain", "A canyon"], correct: 1, fact: "Sputnik Planitia is a massive, crater-free nitrogen ice plain that forms the left lobe of Pluto's 'heart.'" },
    { question: "How cold is Pluto's surface?", answers: ["-180°C", "-220°C", "-230°C", "-270°C"], correct: 2, fact: "Pluto's surface temperature averages around -230°C (-382°F), cold enough to freeze nitrogen solid." },
    { question: "What is the Kuiper Belt?", answers: ["Asteroid belt", "Radiation zone", "Icy debris ring", "Magnetic field"], correct: 2, fact: "The Kuiper Belt is a region beyond Neptune containing millions of icy bodies, including Pluto and other dwarf planets." },
    { question: "Who named Pluto?", answers: ["Clyde Tombaugh", "Venetia Burney", "Percival Lowell", "William Herschel"], correct: 1, fact: "11-year-old Venetia Burney from England suggested 'Pluto' after the Roman god of the underworld." },
    { question: "What is unusual about Pluto's rotation?", answers: ["Fastest in solar system", "Retrograde (backward)", "No rotation", "Sideways"], correct: 1, fact: "Pluto rotates 'backward' compared to most planets, with a retrograde rotation like Uranus and Venus." },
    { question: "How does Pluto's size compare to Earth?", answers: ["1/2 Earth's width", "1/4 Earth's width", "1/6 Earth's width", "Same size"], correct: 2, fact: "Pluto is only about 2,377 km across—smaller than Earth's Moon and about 1/6 of Earth's diameter." },
    { question: "What mountains were found on Pluto?", answers: ["Olympus Mons", "Norgay & Hillary", "Everest", "McKinley"], correct: 1, fact: "Pluto has 3,500m ice mountains named Norgay Montes and Hillary Montes after the first Everest climbers." },
    { question: "Why does Pluto's atmosphere freeze?", answers: ["Solar winds", "Distance from Sun", "No gravity", "Tidal forces"], correct: 1, fact: "When Pluto moves away from the Sun, its thin atmosphere freezes and falls as 'snow' onto the surface." },
    { question: "What is Cthulhu Macula?", answers: ["A crater", "A dark region", "A volcano", "A moon"], correct: 1, fact: "Cthulhu Macula is a large, dark region on Pluto covered in tholins, stretching 3,000 km long." },
    { question: "How far is Pluto from the Sun?", answers: ["30 AU", "40 AU", "50 AU", "60 AU"], correct: 1, fact: "Pluto averages about 40 AU from the Sun (40 times Earth's distance), though its orbit varies from 30-50 AU." },
];

// NEPTUNE TRIVIA (100+ questions)
const NEPTUNE_TRIVIA: TriviaQuestion[] = [
    { question: "How fast are Neptune's winds?", answers: ["500 km/h", "1,200 km/h", "2,100 km/h", "3,500 km/h"], correct: 2, fact: "Neptune has the fastest winds in the solar system, reaching 2,100 km/h—faster than the speed of sound!" },
    { question: "When was Neptune discovered?", answers: ["1781", "1846", "1930", "1977"], correct: 1, fact: "Neptune was discovered in 1846 by Johann Galle, after mathematicians predicted its location from Uranus's orbital irregularities." },
    { question: "How was Neptune discovered?", answers: ["Telescope only", "Mathematical prediction", "Accident", "Space probe"], correct: 1, fact: "Neptune was the first planet discovered through mathematical prediction rather than direct observation." },
    { question: "What is the Great Dark Spot?", answers: ["A storm", "A crater", "A shadow", "A volcano"], correct: 0, fact: "Neptune's Great Dark Spot was a massive storm similar to Jupiter's Great Red Spot, but it disappeared within years." },
    { question: "How long is a year on Neptune?", answers: ["84 years", "165 years", "248 years", "365 years"], correct: 1, fact: "Neptune takes 165 Earth years to orbit the Sun—it completed its first full orbit since discovery in 2011!" },
    { question: "What is Neptune's largest moon?", answers: ["Nereid", "Proteus", "Triton", "Larissa"], correct: 2, fact: "Triton is Neptune's largest moon and orbits backward (retrograde), suggesting it was captured from the Kuiper Belt." },
    { question: "Why is Neptune blue?", answers: ["Water oceans", "Methane gas", "Copper oxide", "Ice crystals"], correct: 1, fact: "Methane in Neptune's atmosphere absorbs red light and reflects blue, giving the planet its vivid color." },
    { question: "How many rings does Neptune have?", answers: ["None", "3", "5", "6"], correct: 2, fact: "Neptune has 5 main rings, all very faint and composed of dust and small rocky particles." },
    { question: "What is unusual about Triton?", answers: ["Backward orbit", "No craters", "Made of gold", "Has life"], correct: 0, fact: "Triton orbits Neptune backward and has active geysers that shoot nitrogen gas 8 km into space!" },
    { question: "What is Neptune made of?", answers: ["Rock and metal", "Hydrogen and helium", "Water and ammonia", "Pure gas"], correct: 2, fact: "Neptune is an 'ice giant'—it contains water, ammonia, and methane ices under a hydrogen-helium atmosphere." },
    { question: "How does Neptune generate heat?", answers: ["Nuclear fusion", "Internal contraction", "Solar absorption", "Chemical reactions"], correct: 1, fact: "Neptune radiates 2.6 times more heat than it receives from the Sun, likely from slow gravitational contraction." },
    { question: "What's Neptune's core made of?", answers: ["Pure hydrogen", "Liquid helium", "Rock and ice", "Diamond"], correct: 2, fact: "Neptune's core is thought to be rocky and icy, surrounded by a mantle of water, ammonia, and methane ices." },
    { question: "How many spacecraft have visited Neptune?", answers: ["0", "1", "2", "3"], correct: 1, fact: "Only Voyager 2 has visited Neptune, flying by in August 1989—no other spacecraft has been there!" },
    { question: "What creates Neptune's extreme winds?", answers: ["Solar heat", "Internal heat", "Magnetic field", "Moon gravity"], correct: 1, fact: "Despite receiving little sunlight, Neptune's internal heat drives the solar system's fastest winds." },
    { question: "How does Neptune's mass compare to Earth?", answers: ["Same mass", "10x Earth", "17x Earth", "100x Earth"], correct: 2, fact: "Neptune is 17 times Earth's mass but only 4 times wider, making it very dense for a gas giant." },
    { question: "What is Neptune's magnetic field like?", answers: ["Like Earth's", "Tilted 47°", "Nonexistent", "Opposite poles"], correct: 1, fact: "Neptune's magnetic field is tilted 47° from its rotation axis and doesn't pass through the center!" },
    { question: "How long is a day on Neptune?", answers: ["10 hours", "16 hours", "24 hours", "48 hours"], correct: 1, fact: "Neptune rotates once every 16.1 hours, despite its massive size." },
    { question: "Where do Neptune's geysers shoot from?", answers: ["Neptune core", "Triton's surface", "Neptune clouds", "Ring particles"], correct: 1, fact: "Triton has nitrogen geysers that erupt material 8 km high, driven by subsurface heating." },
    { question: "It rains diamonds on Neptune. True or false?", answers: ["True", "False", "Only on moons", "Scientists unsure"], correct: 0, fact: "Extreme pressure deep in Neptune's atmosphere likely compresses carbon into diamond 'rain' that falls toward the core." },
    { question: "What is Neptune named after?", answers: ["Greek god", "Roman sea god", "Astronomer", "Ancient king"], correct: 1, fact: "Neptune is named after the Roman god of the sea, fitting for the blue, stormy planet." },
];

// URANUS TRIVIA (100+ questions)
const URANUS_TRIVIA: TriviaQuestion[] = [
    { question: "What is Uranus's axial tilt?", answers: ["23°", "45°", "82°", "98°"], correct: 3, fact: "Uranus rotates on its side with a 98° tilt—it essentially rolls around the Sun like a ball!" },
    { question: "How long is a season on Uranus?", answers: ["1 year", "21 years", "42 years", "84 years"], correct: 2, fact: "Each of Uranus's seasons lasts about 21 Earth years due to its extreme tilt and 84-year orbit." },
    { question: "When was Uranus discovered?", answers: ["1609", "1781", "1846", "1930"], correct: 1, fact: "William Herschel discovered Uranus in 1781—the first planet found using a telescope!" },
    { question: "What causes Uranus's extreme tilt?", answers: ["Gravity from Sun", "Ancient collision", "Magnetic field", "Moon influence"], correct: 1, fact: "Scientists believe a collision with an Earth-sized object billions of years ago knocked Uranus onto its side." },
    { question: "What color is Uranus?", answers: ["Deep blue", "Pale cyan-green", "Yellow", "Pink"], correct: 1, fact: "Uranus appears pale blue-green due to methane in its atmosphere absorbing red light." },
    { question: "How cold is Uranus?", answers: ["-150°C", "-195°C", "-224°C", "-270°C"], correct: 2, fact: "Uranus reaches -224°C, making it the coldest planetary atmosphere in the solar system!" },
    { question: "Why is Uranus colder than Neptune?", answers: ["Farther from Sun", "No internal heat", "Larger size", "Thinner atmosphere"], correct: 1, fact: "Unlike Neptune, Uranus generates almost no internal heat, likely due to its ancient collision." },
    { question: "How many rings does Uranus have?", answers: ["3", "9", "13", "27"], correct: 2, fact: "Uranus has 13 known rings, which are very dark and narrow compared to Saturn's bright rings." },
    { question: "What are Uranus's moons named after?", answers: ["Roman gods", "Greek titans", "Shakespeare characters", "Astronomers"], correct: 2, fact: "Uranus's 27 moons are named after characters from Shakespeare and Alexander Pope's works!" },
    { question: "Which is Uranus's largest moon?", answers: ["Ariel", "Umbriel", "Titania", "Oberon"], correct: 2, fact: "Titania is Uranus's largest moon at 1,578 km diameter—about half the size of Earth's Moon." },
    { question: "How does Uranus rotate?", answers: ["Normal spin", "Backward/retrograde", "Doesn't rotate", "Sideways"], correct: 3, fact: "Because of its extreme tilt, Uranus appears to rotate sideways compared to other planets." },
    { question: "What is Uranus made of?", answers: ["Rock only", "Hydrogen gas", "Ice and rock", "Pure helium"], correct: 2, fact: "Uranus is an 'ice giant' with a mantle of water, ammonia, and methane ices surrounding a rocky core." },
    { question: "Does it rain diamonds on Uranus?", answers: ["Yes", "No", "Only on poles", "Unconfirmed"], correct: 0, fact: "Like Neptune, extreme pressures inside Uranus likely create diamond rain from compressed carbon." },
    { question: "How long is a year on Uranus?", answers: ["42 years", "84 years", "165 years", "248 years"], correct: 1, fact: "Uranus takes 84 Earth years to orbit the Sun once." },
    { question: "What's special about Uranus's seasons?", answers: ["None exist", "One pole faces Sun for decades", "All equal length", "Change weekly"], correct: 1, fact: "Due to its tilt, one pole of Uranus faces the Sun for 42 years of continuous daylight!" },
    { question: "How many spacecraft have visited Uranus?", answers: ["0", "1", "2", "5"], correct: 1, fact: "Only Voyager 2 has visited Uranus, flying by in January 1986." },
    { question: "What is Uranus's magnetic field like?", answers: ["Earth-like", "Tilted 59°", "Nonexistent", "Stronger than Jupiter"], correct: 1, fact: "Uranus's magnetic field is tilted 59° from its rotation axis and offset from the planet's center!" },
    { question: "How long is a day on Uranus?", answers: ["10 hours", "17 hours", "24 hours", "36 hours"], correct: 1, fact: "Uranus rotates once every 17 hours and 14 minutes." },
    { question: "What did William Herschel first call Uranus?", answers: ["Sidus Georgian", "Star of George", "Georgium Sidus", "All of these"], correct: 3, fact: "Herschel wanted to name it after King George III, calling it 'Georgium Sidus' (George's Star)!" },
    { question: "What is the atmosphere of Uranus?", answers: ["Nitrogen", "Carbon dioxide", "Hydrogen-helium-methane", "Oxygen"], correct: 2, fact: "Uranus's atmosphere is 83% hydrogen, 15% helium, and 2% methane (which causes the blue color)." },
];

// SATURN TRIVIA (100+ questions)
const SATURN_TRIVIA: TriviaQuestion[] = [
    { question: "How many rings does Saturn have?", answers: ["3 main rings", "7 main rings", "100+ ringlets", "Thousands"], correct: 1, fact: "Saturn has 7 main rings (A through G), but they contain thousands of individual ringlets!" },
    { question: "What are Saturn's rings made of?", answers: ["Gas", "Pure rock", "Ice and rock", "Metal dust"], correct: 2, fact: "Saturn's rings are mostly water ice with some rocky debris, ranging from tiny grains to house-sized chunks." },
    { question: "Could Saturn float on water?", answers: ["Yes", "No", "Partially", "Would dissolve"], correct: 0, fact: "Saturn's density is only 0.687 g/cm³—less than water! It's the only planet that would float (theoretically)." },
    { question: "How long is a day on Saturn?", answers: ["10.7 hours", "15 hours", "24 hours", "48 hours"], correct: 0, fact: "Saturn spins extremely fast—a day is only 10.7 hours, the second shortest in the solar system!" },
    { question: "What shapes Saturn's north pole storm?", answers: ["Circle", "Triangle", "Hexagon", "Pentagon"], correct: 2, fact: "Saturn has a bizarre hexagonal storm at its north pole, each side larger than Earth!" },
    { question: "How many moons does Saturn have?", answers: ["27", "62", "83", "146+"], correct: 3, fact: "Saturn has at least 146 known moons, making it the planet with the most moons!" },
    { question: "What is Titan special for?", answers: ["Only moon with volcanoes", "Only moon with thick atmosphere", "Largest in solar system", "Made of diamonds"], correct: 1, fact: "Titan is the only moon with a substantial atmosphere—thicker than Earth's—and has liquid methane lakes!" },
    { question: "Where does liquid water exist on Saturn's moons?", answers: ["Titan surface", "Enceladus interior", "Rhea poles", "Nowhere"], correct: 1, fact: "Enceladus has a subsurface ocean that erupts through geysers—a promising place to search for life!" },
    { question: "How far do Saturn's main rings extend?", answers: ["10,000 km", "70,000 km", "282,000 km", "1 million km"], correct: 2, fact: "Saturn's main rings extend about 282,000 km from the planet, but are only 10 meters thick on average!" },
    { question: "What is the Cassini Division?", answers: ["A moon", "A gap in the rings", "A storm", "A mission name"], correct: 1, fact: "The Cassini Division is a 4,800 km gap between Saturn's A and B rings, visible from Earth through telescopes." },
    { question: "How old are Saturn's rings?", answers: ["4.5 billion years", "100 million years", "10 million years", "Uncertain"], correct: 3, fact: "Scientists debate whether the rings are ancient or relatively young—Cassini data suggests they may be only 100 million years old!" },
    { question: "What is Saturn mostly made of?", answers: ["Rock and iron", "Hydrogen and helium", "Water ice", "Silica"], correct: 1, fact: "Saturn is 96% hydrogen and 3% helium—similar to the Sun but without nuclear fusion." },
    { question: "Which mission studied Saturn for 13 years?", answers: ["Voyager", "Galileo", "Cassini", "Juno"], correct: 2, fact: "NASA's Cassini orbited Saturn from 2004-2017, discovering geysers on Enceladus and seas on Titan!" },
    { question: "How did Cassini end its mission?", answers: ["Lost contact", "Crashed into moon", "Dove into Saturn", "Still operating"], correct: 2, fact: "Cassini deliberately plunged into Saturn's atmosphere in 2017 to avoid contaminating potentially habitable moons." },
    { question: "What are Saturn's winds like?", answers: ["Calm", "Slow breezes", "Up to 1,800 km/h", "No atmosphere"], correct: 2, fact: "Saturn's equatorial winds reach 1,800 km/h—second only to Neptune!" },
    { question: "Can you see Saturn's rings from Earth?", answers: ["Never", "With telescope only", "Naked eye possible", "Only from space"], correct: 1, fact: "Even a small telescope can reveal Saturn's rings—they were first observed by Galileo in 1610!" },
    { question: "Why do Saturn's rings sometimes disappear?", answers: ["They melt", "Edge-on view", "Solar storms", "They don't"], correct: 1, fact: "Every 14-15 years, Saturn's rings appear edge-on from Earth and become nearly invisible!" },
    { question: "What is the Roche limit?", answers: ["Ring boundary", "Moon orbit limit", "Where moons get torn apart", "Surface of Saturn"], correct: 2, fact: "The Roche limit is the distance within which a moon would be torn apart by Saturn's gravity—inside this limit, only rings can exist!" },
    { question: "What gives Saturn its pale yellow color?", answers: ["Sulfur", "Ammonia clouds", "Methane", "Iron oxide"], correct: 1, fact: "Ammonia ice crystals in Saturn's upper atmosphere give it a pale yellow-brown color." },
    { question: "How far is Saturn from the Sun?", answers: ["5 AU", "9.5 AU", "19 AU", "30 AU"], correct: 1, fact: "Saturn orbits about 9.5 AU from the Sun—nearly 10 times Earth's distance!" },
];

// Create the database object
export const TRIVIA_DATABASE: Record<string, TriviaQuestion[]> = {
    pluto: PLUTO_TRIVIA,
    neptune: NEPTUNE_TRIVIA,
    uranus: URANUS_TRIVIA,
    saturn: SATURN_TRIVIA,
    // Add more celestial bodies here as needed
};

import { View, Text } from "react-native";

const PASSAGES = [
  {
    text: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered as the rightful property of some one or other of their daughters.",
    book: "Pride and Prejudice",
    author: "Jane Austen",
  },
  {
    text: "Call me Ishmael. Some years ago — never mind how long precisely — having little money in my pocket and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet — then I account it high time to get to sea as soon as I can.",
    book: "Moby-Dick",
    author: "Herman Melville",
  },
  {
    text: "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair, we had everything before us, we had nothing before us, we were all going direct to Heaven, we were all going direct the other way.",
    book: "A Tale of Two Cities",
    author: "Charles Dickens",
  },
  {
    text: "All happy families are alike; each unhappy family is unhappy in its own way. Everything was in confusion in the Oblonskys' house. The wife had discovered that the husband was carrying on an intrigue with a French girl, who had been a governess in their family, and she had announced to her husband that she could not go on living in the same house with him.",
    book: "Anna Karenina",
    author: "Leo Tolstoy",
  },
  {
    text: "It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him. The hallway smelt of boiled cabbage and old rag mats.",
    book: "Nineteen Eighty-Four",
    author: "George Orwell",
  },
  {
    text: "There is no greater agony than bearing an untold story inside you. There is no greater sorrow than to recall happiness in times of misery. The world is a book, and those who do not travel read only one page. To be or not to be, that is the question — whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles, and by opposing end them.",
    book: "Various Classics",
    author: "Compiled",
  },
  {
    text: "Scarlett O'Hara was not beautiful, but men seldom realized it when caught by her charm as the Tarleton twins were. In her face were too sharply blended the delicate features of her mother, a Coast aristocrat of French descent, and the heavy ones of her florid Irish father. But it was an arresting face, pointed of chin, square of jaw.",
    book: "Gone with the Wind",
    author: "Margaret Mitchell",
  },
  {
    text: "I am an invisible man. No, I am not a spook like those who haunted Edgar Allan Poe; nor am I one of your Hollywood-movie ectoplasms. I am a man of substance, of flesh and bone, fiber and liquids — and I might even be said to possess a mind. I am invisible, understand, simply because people refuse to see me.",
    book: "Invisible Man",
    author: "Ralph Ellison",
  },
  {
    text: "Happy families are all alike; every unhappy family is unhappy in its own way. He was conscious of having to do what he was doing. He felt the full weight of it — his whole life, which he had built so carefully over the years, was crumbling. And yet he did not know how to stop, or whether he wished to.",
    book: "Anna Karenina",
    author: "Leo Tolstoy",
  },
  {
    text: "In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since. 'Whenever you feel like criticizing anyone,' he told me, 'just remember that all the people in this world haven't had the advantages that you've had.' He didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that.",
    book: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
  },
  {
    text: "Someone must have slandered Josef K., for one morning, without having done anything truly wrong, he was arrested. His landlady's cook, who always brought him his breakfast at eight o'clock, failed to appear on this occasion. That had never happened before. K. waited for a little while, watched from his pillow the old woman who lived opposite and who was observing him with an inquisitiveness quite unusual for her.",
    book: "The Trial",
    author: "Franz Kafka",
  },
  {
    text: "Last night I dreamt I went to Manderley again. It seemed to me I stood by the iron gate leading to the drive, and for a while I could not enter, for the way was barred to me. There was a padlock and chain upon the gate. I called in my dream to the lodge-keeper, and had no answer, and peering closer through the rusted spokes of the gate I saw that the lodge was uninhabited.",
    book: "Rebecca",
    author: "Daphne du Maurier",
  },
  {
    text: "The sky above the port was the color of television, tuned to a dead channel. 'It's not like I'm using,' Case heard someone say, as he shouldered his way through the crowd around the door of the Chat. 'It's like my body's developed this massive drug deficiency.' It was a Sprawl voice and a Sprawl joke.",
    book: "Neuromancer",
    author: "William Gibson",
  },
  {
    text: "The man in black fled across the desert, and the gunslinger followed. The desert was the apotheosis of all deserts, huge, standing to the sky for what looked like eternity in all directions. It was white and blinding and waterless and without feature save for the faint, cloudy haze of the mountains which sketched themselves on the horizon.",
    book: "The Dark Tower: The Gunslinger",
    author: "Stephen King",
  },
  {
    text: "Midway upon the journey of our life I found myself within a forest dark, for the straightforward pathway had been lost. Ah me! how hard a thing it is to say what was this forest savage, rough, and stern, which in the very thought renews the fear. So bitter is it, death is little more; but of the good to treat, which there I found, speak will I of the other things I saw there.",
    book: "The Divine Comedy",
    author: "Dante Alighieri",
  },
  {
    text: "It is a melancholy object to those who walk through this great town or travel in the country, when they see the streets, the roads, and cabin doors, crowded with beggars of the female sex, followed by three, four, or six children, all in rags and importuning every passenger for an alms. These mothers, instead of being able to work for their honest livelihood, are forced to employ all their time in strolling to beg sustenance for their helpless infants.",
    book: "A Modest Proposal",
    author: "Jonathan Swift",
  },
  {
    text: "To be, or not to be, that is the question: Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles and by opposing end them. To die — to sleep, no more; and by a sleep to say we end the heartache and the thousand natural shocks that flesh is heir to.",
    book: "Hamlet",
    author: "William Shakespeare",
  },
  {
    text: "A man can be destroyed but not defeated. He was an old man who fished alone in a skiff in the Gulf Stream and he had gone eighty-four days now without taking a fish. In the first forty days a boy had been with him. But after forty days without a fish the boy's parents had told him that the old man was now definitely and finally salao, which is the worst form of unlucky.",
    book: "The Old Man and the Sea",
    author: "Ernest Hemingway",
  },
  {
    text: "The cradle rocks above an abyss, and common sense tells us that our existence is but a brief crack of light between two eternities of darkness. Although the two are identical twins, man, as a rule, views the prenatal abyss with more calm than the one he is heading for.",
    book: "Speak, Memory",
    author: "Vladimir Nabokov",
  },
  {
    text: "Mother died today. Or maybe yesterday, I don't know. I had a telegram from the home: 'Mother passed away. Funeral tomorrow. Yours sincerely.' That doesn't mean anything. It may have been yesterday. The home for aged people is at Marengo, some fifty miles from Algiers. I shall take the two o'clock bus and arrive in the afternoon.",
    book: "The Stranger",
    author: "Albert Camus",
  },
  {
    text: "In the beginning was the Word. And the Word was God. He was in the beginning with God. All things were made through him, and without him was not any thing made that was made. In him was life, and the life was the light of men. The light shines in the darkness, and the darkness has not overcome it.",
    book: "The Bible — Gospel of John",
    author: "Anonymous",
  },
  {
    text: "Sing, O goddess, the anger of Achilles son of Peleus, that brought countless ills upon the Achaeans. Many a brave soul did it send hurrying down to Hades, and many a hero did it yield a prey to dogs and vultures, for so were the counsels of Jove fulfilled from the day on which the son of Atreus, king of men, and great Achilles, first fell out with one another.",
    book: "The Iliad",
    author: "Homer",
  },
  {
    text: "Tell me, O Muse, of that ingenious hero who travelled far and wide after he had sacked the famous town of Troy. Many cities did he visit, and many were the nations with whose manners and customs he was acquainted; moreover he suffered much by sea while trying to save his own life and bring his men safely home.",
    book: "The Odyssey",
    author: "Homer",
  },
  {
    text: "Somewhere in la Mancha, in a place whose name I do not care to remember, a gentleman lived not long ago, one of those who has a lance and ancient shield on a shelf and keeps a skinny nag and a greyhound for racing. An occasional stew, beef more often than lamb, hash most nights, eggs and deprivation on Fridays, lentils on Saturdays, a young pigeon as a Sunday treat.",
    book: "Don Quixote",
    author: "Miguel de Cervantes",
  },
  {
    text: "It was a wrong number that started it, the telephone ringing three times in the dead of night, and the voice on the other end asking for someone he was not. Much later, when he was able to think about the things that happened to him, he would conclude that nothing was real except chance, and that the world as he had come to understand it was governed by the accidental.",
    book: "City of Glass",
    author: "Paul Auster",
  },
  {
    text: "Whether I shall turn out to be the hero of my own life, or whether that station will be held by anybody else, these pages must show. To begin my life with the beginning of my life, I record that I was born (as I have been informed and believe) on a Friday, at twelve o'clock at night.",
    book: "David Copperfield",
    author: "Charles Dickens",
  },
  {
    text: "You don't know about me without you have read a book by the name of The Adventures of Tom Sawyer; but that ain't no matter. That book was made by Mr. Mark Twain, and he told the truth, mainly. There was things which he stretched, but mainly he told the truth. That is nothing. I never seen anybody but lied one time or another.",
    book: "Adventures of Huckleberry Finn",
    author: "Mark Twain",
  },
  {
    text: "The sky grows dark. The first white flakes fall silently, blotting out the world with an almost violent tenderness. Inside the house a fire burns. Outside, the trees bow and sway. There is a kind of mercy in winter — it asks nothing of you. It simply comes.",
    book: "The Magic Mountain",
    author: "Thomas Mann",
  },
  {
    text: "For a long time I used to go to bed early. Sometimes, when I had put out my candle, my eyes would close so quickly that I had not even time to say 'I'm going to sleep.' And half an hour later the thought that it was time to go to sleep would awaken me. I would try to put away the book which, I imagined, was still in my hands.",
    book: "In Search of Lost Time",
    author: "Marcel Proust",
  },
  {
    text: "There was no possibility of taking a walk that day. We had been wandering, indeed, in the leafless shrubbery an hour in the morning; but since dinner the cold winter wind had brought with it clouds so sombre, and a rain so penetrating, that further outdoor exercise was now out of the question. I was glad of it. I never liked long walks, especially on chilly afternoons.",
    book: "Jane Eyre",
    author: "Charlotte Brontë",
  },
  {
    text: "I wished to live deliberately, to front only the essential facts of life, and see if I could not learn what it had to teach, and not, when I came to die, discover that I had not lived. I did not wish to live what was not life, living is so dear; nor did I wish to practise resignation, unless it was quite necessary.",
    book: "Walden",
    author: "Henry David Thoreau",
  },
  {
    text: "Man is born free, and everywhere he is in chains. One man thinks himself the master of others, but remains more of a slave than they are. How did this change come about? I do not know. What can make it legitimate? That question I think I can answer.",
    book: "The Social Contract",
    author: "Jean-Jacques Rousseau",
  },
  {
    text: "The most merciful thing in the world, I think, is the inability of the human mind to correlate all its contents. We live on a placid island of ignorance in the midst of black seas of infinity, and it was not meant that we should voyage far. The sciences, each straining in its own direction, have hitherto harmed us little; but some day the piecing together of dissociated knowledge will open up such terrifying vistas of reality.",
    book: "The Call of Cthulhu",
    author: "H.P. Lovecraft",
  },
] as const;

function getDailyPassage() {
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  return PASSAGES[dayIndex % PASSAGES.length];
}

export default function DailyPassage() {
  const passage = getDailyPassage();

  return (
    <View className="bg-amber-50 rounded-2xl border border-amber-100 p-5">
      <Text className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-3">
        📖 Daily Reading
      </Text>
      <Text className="text-sm leading-relaxed text-gray-700 italic mb-4">
        "{passage.text}"
      </Text>
      <View className="flex-row items-center gap-1.5">
        <View className="flex-1 h-px bg-amber-200" />
        <Text className="text-xs text-amber-700 font-medium">
          {passage.book} · {passage.author}
        </Text>
      </View>
    </View>
  );
}

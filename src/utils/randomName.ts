const adjectives = [
    "Adventurous", "Playful", "Mysterious", "Courageous", "Smart", "Curious",
    "Gentle", "Quirky", "Brave", "Sneaky", "Jolly", "Happy", "Unknown", "Silly"
  ];
  
  const animals = [
    "Giraffe", "Elephant", "Panda", "Tiger", "Goose", "Axolotl", "Lobster",
    "Koala", "Otter", "Penguin", "Zebra", "Lion", "Rabbit", "Capybara"
  ];

  export function getRandomName(address: string): string {
  
    const normalizedAddress = address.toLowerCase();
  
    let hash = 0;
    for (let i = 0; i < normalizedAddress.length; i++) {
      hash = normalizedAddress.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash;
    }
    const adj = adjectives[Math.abs(hash) % adjectives.length];
    const animal = animals[Math.abs(hash >> 4) % animals.length];
    return `${adj} ${animal}`;
  }
  
const MAP_NODES = [
    { id: "stage1", x: 100, y: 480, label: "コンソメパンチ", bag: "Bag_Consomme", connections: ["stage2"] },
    { id: "stage2", x: 260, y: 380, label: "幸せバター", bag: "Bag_Butter", connections: ["stage1", "stage3"] },
    { id: "stage3", x: 400, y: 460, label: "梅しそ", bag: "Bag_Ume", connections: ["stage2", "stage4"] },
    { id: "stage4", x: 560, y: 350, label: "ワサビーフ", bag: "Bag_Wasabeef", connections: ["stage3", "stage5"] },
    { id: "stage5", x: 720, y: 220, label: "うすしお（最終決戦）", bag: "Bag_Usushio", connections: ["stage4"] }
];


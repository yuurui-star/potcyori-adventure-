const MAP_NODES = [
    { id: "stage1", x: 150, y: 550, label: "コンソメパンチ", bag: "Bag_Consomme", connections: ["stage2"] },
    { id: "stage2", x: 400, y: 400, label: "幸せバター", bag: "Bag_Butter", connections: ["stage1", "stage3"] },
    { id: "stage3", x: 600, y: 550, label: "梅しそ", bag: "Bag_Ume", connections: ["stage2", "stage4"] },
    { id: "stage4", x: 850, y: 400, label: "ワサビーフ", bag: "Bag_Wasabeef", connections: ["stage3", "stage5"] },
    { id: "stage5", x: 1100, y: 250, label: "うすしお（最終決戦）", bag: "Bag_Usushio", connections: ["stage4"] }
];


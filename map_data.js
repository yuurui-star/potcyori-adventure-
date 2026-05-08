const MAP_NODES = [
    { id: "stage1", x: 180, y: 330, label: "コンソメパンチ", bag: "Bag_Consomme", connections: ["stage2"] },
    { id: "stage2", x: 300, y: 230, label: "幸せバター", bag: "Bag_Butter", connections: ["stage1", "stage3"] },
    { id: "stage3", x: 400, y: 310, label: "梅しそ", bag: "Bag_Ume", connections: ["stage2", "stage4"] },
    { id: "stage4", x: 500, y: 200, label: "ワサビーフ", bag: "Bag_Wasabeef", connections: ["stage3", "stage5"] },
    { id: "stage5", x: 620, y: 70, label: "うすしお（最終決戦）", bag: "Bag_Usushio", connections: ["stage4"] }
];


// --- アセット管理 ---
const ASSETS = {
    'title_logo': 'assets/title_logo.png',
    'game_title_logo': 'assets/game_title_logo.png',
    'bg_worldmap': 'assets/bg_worldmap_hd.png',
    'bg_stage1': 'assets/bg_stage1_hd.png',
    'bg_stage2': 'assets/bg_stage2_hd.png',
    'bg_stage3': 'assets/bg_stage3_hd.png',
    'bg_stage4': 'assets/bg_stage4_hd.png',
    'bg_stage5': 'assets/bg_stage5_hd.png',
    'bg_blue_sky': 'assets/bg_blue_sky.png',

    'story_sleeping': 'assets/story_sleeping.png',
    'story_theft': 'assets/story_theft.png',
    'story_angry': 'assets/story_angry.png',
    'chip': 'assets/chip.png',
    'enemy': 'assets/enemy.png',
    'beef': 'assets/beef.png',
    'yuno': 'assets/yuno.png',
    'yuno_hit': 'assets/yuno_hit.png',
    'soul_fire': 'assets/soul_fire.png',
    'PotatoChip_Single': 'assets/PotatoChip_Single.png',
    'PotatoChip_Bag': 'assets/PotatoChip_Bag.png',
    'Bag_Usushio': 'assets/Bag_Usushio.png',
    'Bag_Consomme': 'assets/Bag_Consomme.png',
    'Bag_Ume': 'assets/Bag_Ume.png',
    'Bag_Butter': 'assets/Bag_Butter.png',
    'Bag_Wasabeef': 'assets/Bag_Wasabeef.png',
    'cyori': 'assets/cyori.png',
    'cyori_0': 'assets/cyori_0.png',
    'cyori_1': 'assets/cyori_1.png',
    'cyori_2': 'assets/cyori_2.png',
    'cyori_3': 'assets/cyori_3.png',
    'cyori_4': 'assets/cyori_4.png',
    'cyori_5': 'assets/cyori_5.png',
    'cyori_6': 'assets/cyori_6.png',
    'cyori_7': 'assets/cyori_7.png',
    'cyori_8': 'assets/cyori_8.png',
    'cyori_9': 'assets/cyori_9.png',
    'cyori_10': 'assets/cyori_10.png',
    'cyori_11': 'assets/cyori_11.png',
    'story_ending_peace': 'assets/story_ending_peace.png',
    'bgm_map': 'assets/worldMap.mp3',
    'bgm_title': 'assets/title.mp3',
    'bgm_stage1': 'assets/stage1.mp3',
    'bgm_stage2': 'assets/stage2.mp3',
    'bgm_stage3': 'assets/stage3.mp3',
    'bgm_stage4': 'assets/stage4.mp3',
    'bgm_stage5': 'assets/stage5.mp3'




};

let gameStarted = false, phaserGame = null;
let currentStoryIdx = 0, isEnding = false;
let currentStageId = "stage1";
let stageProgress = {
    "stage1": { cleared: false, perfect: false },
    "stage2": { cleared: false, perfect: false },
    "stage3": { cleared: false, perfect: false },
    "stage4": { cleared: false, perfect: false },
    "stage5": { cleared: false, perfect: false }
};
let isTimeAttack = false;
let taStartTime = 0;
let taElapsedTime = 0;
let taTimerInterval = null;


const gameImages = {}; // 透過処理済みの画像を保持

// モバイル操作用ステート
const mobileInput = { left: false, right: false, jump: false, dash: false };

function initMobileControls() {
    const btns = {
        'btn-left': 'left',
        'btn-right': 'right',
        'btn-jump': 'jump',
        'btn-dash': 'dash'
    };
    Object.keys(btns).forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const key = btns[id];
        const start = (e) => { e.preventDefault(); mobileInput[key] = true; };
        const end = (e) => { e.preventDefault(); mobileInput[key] = false; };
        el.addEventListener('mousedown', start);
        el.addEventListener('mouseup', end);
        el.addEventListener('mouseleave', end);
        el.addEventListener('touchstart', start, { passive: false });
        el.addEventListener('touchend', end, { passive: false });
    });
}

// --- UI制御 ---
function showTitleSplash() {
    // 1. 全ての外部UIを一括で完全に隠す（クリーンアップ）
    const allUI = ['wm-ui', 'hud', 'mobile-controls', 'opening-overlay', 'ending-overlay', 'clear-overlay', 'dialogue-container', 'pause-overlay', 'title-splash', 'brand-splash'];
    allUI.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

    const splash = document.getElementById('title-splash');
    splash.classList.remove('hidden');
    const logo = document.getElementById('title-logo');

    // タイトル画面が表示された瞬間にBGM再生開始
    playTitleBGM();

    // ロゴの表示（透過処理済みデータを優先、なければ元の画像）
    if (logo) {
        if (gameImages.game_title_logo && gameImages.game_title_logo.src) {
            logo.src = gameImages.game_title_logo.src;
            logo.style.filter = "drop-shadow(0 0 15px rgba(255,255,255,0.5))";
            console.log("Applied transparency to title logo!");
        } else {
            // まだ透過済みでない場合は、透過処理を予約（または即時実行）
            const tempImg = new Image();
            tempImg.onload = () => {
                removeWhiteBackground(tempImg, (t, dataUrl) => {
                    gameImages.game_title_logo = { img: t, src: dataUrl };
                    logo.src = dataUrl;
                    logo.style.filter = "drop-shadow(0 0 15px rgba(255,255,255,0.5))";
                }, true);
            };
            tempImg.src = ASSETS.game_title_logo;
        }
    }





    
    if (ASSETS.bg_blue_sky) {
        splash.style.backgroundImage = `url(${ASSETS.bg_blue_sky})`;
    }

    
    document.getElementById('start-normal-btn').onclick = () => {
        isTimeAttack = false;
        splash.classList.add('hidden');
        startOpening();
    };
    document.getElementById('start-ta-btn').onclick = () => {
        isTimeAttack = true;
        // TAモード開始時に進行状況を全リセット！！
        for (let key in stageProgress) {
            stageProgress[key] = { cleared: false, perfect: false };
        }
        currentStageId = "stage1";
        taStartTime = Date.now();
        taElapsedTime = 0;
        splash.classList.add('hidden');
        // TAモードではオープニングをスキップして即ワールドマップへ！！
        if (phaserGame) phaserGame.scene.start('WorldMapScene', { fromOpening: true });
    };


    const pauseExitBtn = document.getElementById('pause-exit-btn');
    if (pauseExitBtn) {
        pauseExitBtn.onclick = () => {
            if (phaserGame) {
                phaserGame.sound.stopAll();
                phaserGame.scene.stop('WorldMapScene');
                phaserGame.scene.stop('PlayScene');
                const playScene = phaserGame.scene.getScene('PlayScene');
                if (playScene && playScene.isPaused) playScene.isPaused = false;
            }
            document.getElementById('pause-overlay').classList.add('hidden');
            showTitleSplash();
        };
    }
}




function playTitleBGM() {
    try {
        const titleBgm = phaserGame.sound.get('bgm_title');
        if (titleBgm) {
            if (!titleBgm.isPlaying) titleBgm.play({ loop: true });
        } else {
            phaserGame.sound.play('bgm_title', { loop: true });
        }
    } catch (e) { console.warn("BGM Play Error:", e); }
}

function startOpening() {
    // 外部UIのクリーンアップ
    ['wm-ui', 'hud', 'mobile-controls', 'title-splash'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    
    currentStoryIdx = 0; isEnding = false; showStorySlide();

    document.getElementById('opening-overlay').classList.remove('hidden');
    document.getElementById('opening-next-btn').onclick = nextStorySlide;
}

function showStorySlide() {
    const script = isEnding ? endingScript : openingScript;
    const imgId = isEnding ? 'ending-img' : 'opening-img', textId = isEnding ? 'ending-text' : 'opening-text';
    const btnId = isEnding ? 'ending-close-btn' : 'opening-next-btn';
    const slide = script[currentStoryIdx];
    const img = document.getElementById(imgId), txt = document.getElementById(textId);
    const btn = document.getElementById(btnId);
    
    if (img) {
        img.src = ASSETS[slide.img] || ASSETS.Bag_Consomme || "";
        img.style.objectFit = 'contain';
        img.style.objectPosition = 'center';
        img.style.transform = 'none';
        img.style.width = '100%';
        img.style.height = '100%';
    }
    if (txt) txt.innerText = slide.text;

    if (btn) {
        if (currentStoryIdx < script.length - 1) {
            btn.innerText = "次へ";
        } else {
            btn.innerText = isEnding ? "タイトルへ" : "冒険を始める";
        }
    }
}

function nextStorySlide() {
    currentStoryIdx++;
    const script = isEnding ? endingScript : openingScript;
    if (currentStoryIdx < script.length) showStorySlide();
    else {
        if (isEnding) location.reload();
        else { 
            document.getElementById('opening-overlay').classList.add('hidden'); 
            // タイトルBGMを停止
            const titleBgm = phaserGame.sound.get('bgm_title');
            if (titleBgm) titleBgm.stop();
            phaserGame.scene.start('WorldMapScene', { fromOpening: true });
        }
    }
}

function startEnding() {
    isEnding = true; currentStoryIdx = 0; showStorySlide();
    document.getElementById('ending-overlay').classList.remove('hidden');
    document.getElementById('ending-close-btn').onclick = nextStorySlide;
}

let dialogueTimer = null;
function showDialogue(text, speaker = 'Cyori') {
    const container = document.getElementById('dialogue-container');
    const textEl = document.getElementById('dialogue-text');
    const speakerEl = document.getElementById('dialogue-speaker');
    if (!container || !textEl || !speakerEl) return;
    if (dialogueTimer) clearTimeout(dialogueTimer);
    
    speakerEl.innerText = speaker;
    textEl.innerText = text;
    
    // スピーカーに合わせてクラスを切り替え
    container.classList.remove('yuno');
    if (speaker === 'Yuno') container.classList.add('yuno');
    
    container.classList.remove('hidden');
    dialogueTimer = setTimeout(() => { container.classList.add('hidden'); dialogueTimer = null; }, 4000);
}

function showClearScreen(bagKey, scene) {
    const overlay = document.getElementById('clear-overlay');
    const img = document.getElementById('completed-package');
    img.src = ASSETS[bagKey] || "";
    overlay.classList.remove('hidden');
    
    const taPanel = document.getElementById('total-ta-time');
    const msg = document.getElementById('clear-message');
    if (isTimeAttack && currentStageId === "stage5") {
        const timeStr = formatTime(taElapsedTime);
        if (!taPanel) {
            const timeEl = document.createElement('div');
            timeEl.id = 'total-ta-time';
            timeEl.className = 'ta-time-result'; // クラスを付けてCSSで制御！！
            timeEl.innerText = `TOTAL TIME: ${timeStr}`;
            msg.parentNode.insertBefore(timeEl, msg.nextSibling);
        } else {
            taPanel.innerText = `TOTAL TIME: ${timeStr}`;
            taPanel.classList.remove('hidden');
        }
    } else if (taPanel) {
        taPanel.classList.add('hidden');
    }

    document.getElementById('next-stage-btn').onclick = () => {
        overlay.classList.add('hidden');
        if (currentStageId === "stage5") {
            if (isTimeAttack) {
                // TAモードではエンディングをカットしてタイトルへ直行！！
                phaserGame.sound.stopAll();
                showTitleSplash();
            } else {
                startEnding();
            }
        } else {
            scene.scene.start('WorldMapScene');
        }
    };

}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
}


function togglePause(scene) {
    if (!scene) return;
    scene.isPaused = !scene.isPaused;
    const overlay = document.getElementById('pause-overlay');
    const exitBtn = document.getElementById('pause-exit-btn');
    const resumeBtn = document.getElementById('resume-btn');

    if (scene.isPaused) {
        // 物理演算がある場合のみ停止
        if (scene.physics && scene.physics.world) scene.physics.world.pause();
        overlay.classList.remove('hidden');

        const wmBtn = document.getElementById('pause-worldmap-btn');

        // ボタンの表示・非表示と機能を動的に切り替え
        if (exitBtn) {
            exitBtn.innerText = 'タイトルへ戻る';
            exitBtn.onclick = (e) => {
                if (e) e.preventDefault();
                scene.isPaused = false;
                overlay.classList.add('hidden');
                phaserGame.sound.stopAll();
                phaserGame.scene.stop('PlayScene');
                phaserGame.scene.stop('WorldMapScene');
                showTitleSplash();
            };
            exitBtn.ontouchend = exitBtn.onclick;
        }

        if (wmBtn) {
            if (scene.scene.key === 'PlayScene') {
                wmBtn.classList.remove('hidden');
                wmBtn.onclick = (e) => {
                    if (e) e.preventDefault();
                    scene.isPaused = false;
                    overlay.classList.add('hidden');
                    phaserGame.sound.stopAll();
                    scene.scene.stop('PlayScene');
                    scene.scene.start('WorldMapScene');
                };
                wmBtn.ontouchend = wmBtn.onclick;
            } else {
                wmBtn.classList.add('hidden');
            }
        }


    } else {
        if (scene.physics && scene.physics.world) scene.physics.world.resume();
        overlay.classList.add('hidden');
    }
}


// 透過処理（外側からのシードフィル方式）
function removeWhiteBackground(img, callback, isFullRemoval = false) {
    try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        const width = canvas.width, height = canvas.height;
        const visited = new Uint8Array(width * height);
        const stack = [];
        
        // 黄金のしきい値: ロゴは枠を消すために攻め(210)、キャラは服を守りつつ隙間を消す(235)
        const threshold = isFullRemoval ? 210 : 235;
        console.log(`[RESTORED] key=${isFullRemoval ? 'LOGO' : 'CHAR'}, threshold=${threshold}`);


        // 1. 全周シードフィル（上下左右の全境界ドットから開始して、外側の背景を根こそぎ消す）
        for (let x = 0; x < width; x++) { stack.push([x, 0], [x, height - 1]); }
        for (let y = 0; y < height; y++) { stack.push([0, y], [width - 1, y]); }

        while (stack.length > 0) {
            const [px, py] = stack.pop();
            const idx = py * width + px;
            if (px < 0 || px >= width || py < 0 || py >= height || visited[idx]) continue;
            visited[idx] = 1;
            const i = idx * 4;
            if (pixels[i+3] > 10 && pixels[i] > threshold && pixels[i+1] > threshold && pixels[i+2] > threshold) {
                pixels[i+3] = 0;
                stack.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]);
            }
        }

        // 2. 極・精密全域走査（キャラの足の間の閉じられた「完全な白」だけを葬る）
        // ロゴ（isFullRemoval=true）の場合は、中身を守るために全域走査はスキップするぜ！！
        if (!isFullRemoval) {
            const fineThreshold = 250;
            for (let i = 0; i < pixels.length; i += 4) {
                if (pixels[i+3] > 10 && pixels[i] > fineThreshold && pixels[i+1] > fineThreshold && pixels[i+2] > fineThreshold) {
                    pixels[i+3] = 0;
                }
            }
        }





        
        ctx.putImageData(imageData, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        const newImg = new Image();
        newImg.onload = () => callback(newImg, dataUrl);
        newImg.src = dataUrl;
    } catch (e) { callback(img, img.src); }
}

// --- Phaser シーン ---
class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); this.started = false; }
    preload() {

        // タイトル帰還時などの重複登録エラーを物理的に防ぐため、主要なテクスチャを強制クリア
        ['game_title_logo', 'title_logo', 'bg_blue_sky', 'bg_worldmap'].forEach(key => {
            if (this.textures.exists(key)) this.textures.remove(key);
        });

        // ロード画面が始まった瞬間に、全ての外部UIを根こそぎ隠す（強制クリーンアップ）
        ['wm-ui', 'hud', 'mobile-controls', 'title-splash', 'opening-overlay', 'ending-overlay', 'clear-overlay', 'dialogue-container', 'pause-overlay', 'brand-splash'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });


        // プログラムで「ドットちょり」を描画して生成する

        // これにより、画像の読み込みを待たずに最初から表示可能になるぜ！
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xffffff, 1); g.fillRect(4, 0, 12, 16); // 髪と顔
        g.fillStyle(0x333333, 1); g.fillRect(4, 12, 12, 8); // 服
        g.fillStyle(0x880000, 1); g.fillRect(8, 0, 4, 4);   // リボン
        g.generateTexture('cyori_icon', 20, 20);

        // ロード画面用アセット（既にASSETSにあるものを流用）
        this.load.image('title_logo', ASSETS.title_logo);
        this.load.image('game_title_logo', ASSETS.game_title_logo);
        this.load.image('bg_blue_sky', ASSETS.bg_blue_sky);

        // ロード画面の構築
        const { width, height } = this.cameras.main;
        this.add.rectangle(width / 2, height / 2, width, height, 0x0f0c29); // ダークブルー背景
        
        // 装飾（星空風）
        for(let i=0; i<150; i++) {
            this.add.circle(Math.random()*width, Math.random()*height, Math.random()*2, 0xffffff, Math.random());
        }

        const barWidth = Math.min(400, width * 0.8);
        const barHeight = 10;
        const barX = (width - barWidth) / 2;
        const barY = height / 2 + 50;


        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(barX - 5, barY - 5, barWidth + 10, barHeight + 10);

        const progressBar = this.add.graphics();
        
        const loadingText = this.add.text(width / 2, height / 2 - 50, 'LOADING...', {
            font: '32px Outfit', fill: '#ffffff', stroke: '#e94560', strokeThickness: 4
        }).setOrigin(0.5, 0.5);
        this.tweens.add({ targets: loadingText, alpha: 0.3, duration: 800, yoyo: true, loop: -1 });

        const percentText = this.add.text(width / 2, barY + 30, '0%', {
            font: '18px Outfit', fill: '#ffffff'
        }).setOrigin(0.5, 0.5);

        // 走るちょり (生成済みの cyori_icon を使用)
        const runner = this.add.image(barX, barY - 25, 'cyori_icon').setDisplaySize(30, 30).setOrigin(0.5, 1);

        const keys = Object.keys(ASSETS);
        let loadedCount = 0;
        const checkStart = () => {
            loadedCount++;
            const progress = loadedCount / keys.length;
            progressBar.clear();
            progressBar.fillStyle(0xe94560, 1);
            progressBar.fillRect(barX, barY, barWidth * progress, barHeight);
            
            percentText.setText(Math.round(progress * 100) + '%');
            runner.x = barX + (barWidth * progress);
            runner.y = barY - 25 + Math.sin(loadedCount * 0.5) * 5; // ぴょこぴょこ動く

            if (loadedCount >= keys.length) {
                if (this.started) return;
                this.started = true;
                this.time.delayedCall(500, () => {
                    showBrandSplash();
                    this.scene.stop('BootScene');
                });
            }
        };
        keys.forEach(key => {
            const img = new Image();
            img.onload = () => {
                // 透過が必要なもの（プロジェクトロゴは絶対に含めない！！）
                const needsTransparency = ['chip', 'enemy', 'soul_fire', 'beef', 'yuno', 'game_title_logo'].includes(key) || key.startsWith('cyori_');




                
                if (needsTransparency) {
                    const isFull = (key === 'game_title_logo' || key === 'title_logo');
                    removeWhiteBackground(img, (t, dataUrl) => {
                        // 重複登録を絶対に防ぐガード
                        if (!this.textures.exists(key)) {
                            this.textures.addImage(key, t);
                            gameImages[key] = { img: t, src: dataUrl };
                        }
                        checkStart();
                    }, isFull);
                } else {
                    if (!this.textures.exists(key)) {
                        this.textures.addImage(key, img);
                        gameImages[key] = { img: img, src: img.src };
                    }
                    checkStart();
                }





            };
            img.onerror = () => {
                console.warn(`Failed to load asset: ${key} at ${ASSETS[key]}`);
                checkStart();
            };
            img.src = ASSETS[key];
        });
        // BGMロード（ASSETS定義とキーを同期）
        this.load.audio('bgm_title', ASSETS.bgm_title);
        this.load.audio('bgm_map', ASSETS.bgm_map);
        for(let i=1; i<=5; i++) {
            const key = `bgm_stage${i}`;
            if (ASSETS[key]) this.load.audio(key, ASSETS[key]);
        }

        
        if (keys.length === 0) { this.started = true; this.scene.start('WorldMapScene'); }
    }
}

function updateHUD(chipsCountVal = null) {
    const chipsCount = document.getElementById('chips-count');
    const currentStage = document.getElementById('current-stage');
    const hudChip = document.getElementById('hud-chip-icon');

    // 数値の更新
    if (chipsCountVal !== null && chipsCount) chipsCount.innerText = chipsCountVal;
    if (currentStage) currentStage.innerText = currentStageId.replace('stage', '');
    
    // アイコンの復活（透過処理済みを優先）
    if (hudChip) {
        if (gameImages.chip && gameImages.chip.src) {
            hudChip.src = gameImages.chip.src;
        } else {
            hudChip.src = ASSETS.chip;
        }
    }
}




function showBrandSplash() {
    const brand = document.getElementById('brand-splash');
    if (!brand) { showTitleSplash(); return; }
    const logo = document.getElementById('brand-logo');
    if (logo && gameImages.title_logo) logo.src = gameImages.title_logo.src;
    
    // ブラウザの自動再生制限を回避するため、最初のクリックで音が出るように準備
    brand.style.cursor = 'pointer';
    brand.onclick = () => {
        playTitleBGM();
        proceed();
    };

    brand.classList.remove('hidden');
    const timer = setTimeout(proceed, 3500);

    function proceed() {
        clearTimeout(timer);
        brand.classList.add('hidden');
        showTitleSplash();
    }
}

class WorldMapScene extends Phaser.Scene {
    constructor() { super('WorldMapScene'); }
    create() {
        // 1. ワールドマップに必要なUIだけを「明示的に」出す
        document.getElementById('wm-ui').classList.remove('hidden');
        document.getElementById('hud').classList.remove('hidden');
        document.getElementById('mobile-controls').classList.remove('hidden');
        
        updateHUD(0);



        const { width, height } = this.cameras.main;
        if (this.textures.exists('bg_worldmap')) {
            const bg = this.add.image(width / 2, height / 2, 'bg_worldmap');
            const scaleX = width / bg.width;
            bg.setScale(scaleX); // 横幅優先でフィット！！
        } else {

            this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);
        }

        
        // BGM再生管理
        if (!this.sound.get('bgm_map')) {
            this.sound.play('bgm_map', { loop: true, volume: 0.5 });
        } else if (!this.sound.get('bgm_map').isPlaying) {
            this.sound.play('bgm_map', { loop: true, volume: 0.5 });
        }
        for(let i=1; i<=5; i++) { if(this.sound.get(`bgm_stage${i}`)) this.sound.stopByKey(`bgm_stage${i}`); }
        
        const graphics = this.add.graphics();

        graphics.lineStyle(4, 0xffffff, 0.3);
        MAP_NODES.forEach(node => {
            // ワイド画面に合わせてノードのX座標をスケーリング (800基準から現在の幅へ)
            const nodeX = (node.x / 800) * width;
            const nodeY = (node.y / 600) * height;
            node.renderX = nodeX; // 描画用座標を保存
            node.renderY = nodeY;
        });

        MAP_NODES.forEach(node => {
            node.connections.forEach(connId => {
                const conn = MAP_NODES.find(n => n.id === connId);
                if (conn) {
                    graphics.lineBetween(node.renderX, node.renderY, conn.renderX, conn.renderY);
                }
            });
        });
        MAP_NODES.forEach(node => {
            const container = this.add.container(node.renderX, node.renderY);
            const bagKey = node.bag;
            const bag = this.add.image(0, 0, this.textures.exists(bagKey) ? bagKey : 'block').setDisplaySize(60, 80);
            const label = this.add.text(0, 50, node.label, { 
                font: 'bold 16px Noto Sans JP', 
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4,
                shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 2, stroke: true, fill: true }
            }).setOrigin(0.5);

            container.add([bag, label]);
            const progress = stageProgress[node.id];
            if (progress.perfect) { bag.setTint(0xffffff).setAlpha(1.0); }
            else if (progress.cleared) { bag.setTint(0x888888).setAlpha(0.8); }
            else { bag.setTint(0x222222).setAlpha(0.5); }
            this.tweens.add({ targets: bag, y: -10, duration: 1000 + Math.random()*500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        });
        const startNode = MAP_NODES.find(n => n.id === currentStageId) || MAP_NODES[0];
        this.mapPlayer = this.add.sprite(startNode.renderX, startNode.renderY - 20, 'cyori_0').setDisplaySize(40, 50);
        this.mapPlayer.currentNodeId = startNode.id;

        this.mapPlayer.isMoving = false;
        
        // カメラ設定: マップ中央にフォーカスし、見切れを防止するぜ！！
        this.cameras.main.setBounds(0, 0, width, height);
        this.cameras.main.centerOn(width / 2, height / 2); // ど真ん中に固定！！
        this.cameras.main.setZoom(1.25); /* 迫力と全体像を両立させる 1.25倍！！ */

        this.cursors = this.input.keyboard.createCursorKeys();

        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        
        // ポーズ画面からの再開ボタン設定
        const resumeBtn = document.getElementById('resume-btn');
        if (resumeBtn) {
            const handleResume = (e) => {
                if (e) e.preventDefault();
                document.getElementById('pause-overlay').classList.add('hidden');
                this.scene.resume();
            };
            resumeBtn.onclick = handleResume;
            resumeBtn.ontouchend = handleResume;
        }

        const pauseBtn = document.getElementById('btn-pause');
        if (pauseBtn) {
            const handlePause = (e) => {
                if (e) e.preventDefault();
                togglePause(this);
            };
            pauseBtn.onclick = handlePause;
            pauseBtn.ontouchend = handlePause;
        }

    }
    update() {
        if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
            togglePause(this);
        }

        if (this.mapPlayer.isMoving) return;

        let targetId = null;
        const left = Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.wasd.A) || (mobileInput.left && !this._lastMobileLeft);
        const right = Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.wasd.D) || (mobileInput.right && !this._lastMobileRight);
        const up = Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.wasd.W) || (mobileInput.jump && !this._lastMobileJump);
        const down = Phaser.Input.Keyboard.JustDown(this.cursors.down) || Phaser.Input.Keyboard.JustDown(this.wasd.S);

        if (left) targetId = this.findNearestNode(MAP_NODES.find(n => n.id === this.mapPlayer.currentNodeId), 'left');
        else if (right) targetId = this.findNearestNode(MAP_NODES.find(n => n.id === this.mapPlayer.currentNodeId), 'right');
        else if (up) targetId = this.findNearestNode(MAP_NODES.find(n => n.id === this.mapPlayer.currentNodeId), 'up');
        else if (down) targetId = this.findNearestNode(MAP_NODES.find(n => n.id === this.mapPlayer.currentNodeId), 'down');

        this._lastMobileLeft = mobileInput.left;
        this._lastMobileRight = mobileInput.right;
        this._lastMobileJump = mobileInput.jump;

        if (targetId) {
            // TAモード中は、前のステージをPerfectクリアしていないと次の移動を許さないぜ！！
            if (isTimeAttack) {
                const targetStageNum = parseInt(targetId.replace('stage', ''));
                const currentStageNum = parseInt(this.mapPlayer.currentNodeId.replace('stage', ''));
                // 先のステージへ行こうとしている場合のみチェック
                if (targetStageNum > currentStageNum) {
                    const prevStageId = `stage${targetStageNum - 1}`;
                    if (!stageProgress[prevStageId] || !stageProgress[prevStageId].perfect) {
                        showDialogue("あかん！前のステージでポテチ全部集めな進まれへんわ！");
                        return;
                    }
                }
            }
            this.movePlayerToNode(targetId);
        }
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space) || (mobileInput.dash && !this._lastMobileDash)) { 
            currentStageId = this.mapPlayer.currentNodeId; 
            this.scene.stop('WorldMapScene');
            this.scene.start('PlayScene'); 
        }

        this._lastMobileDash = mobileInput.dash;
    }
    findNearestNode(node, dir) {
        return node.connections.find(connId => {
            const conn = MAP_NODES.find(n => n.id === connId);
            if (dir === 'left') return conn.x < node.x;
            if (dir === 'right') return conn.x > node.x;
            if (dir === 'up') return conn.y < node.y;
            if (dir === 'down') return conn.y > node.y;
            return false;
        });
    }
    movePlayerToNode(targetId) {
        const target = MAP_NODES.find(n => n.id === targetId);
        this.mapPlayer.isMoving = true;
        this.tweens.add({
            targets: this.mapPlayer, 
            x: target.renderX, 
            y: target.renderY - 20, 
            duration: 500,
            onComplete: () => { this.mapPlayer.currentNodeId = targetId; this.mapPlayer.isMoving = false; }
        });
    }

}

class PlayScene extends Phaser.Scene {
    constructor() { super('PlayScene'); }
    create() {
        // 1. プレイ中に必要なUIだけを「明示的に」出す
        document.getElementById('wm-ui').classList.add('hidden'); // マップUIは隠す
        document.getElementById('hud').classList.remove('hidden');
        document.getElementById('mobile-controls').classList.remove('hidden');

        // TAモードならタイマーを確実に表示！！
        const taPanel = document.getElementById('ta-timer-panel');
        if (taPanel) {
            if (isTimeAttack) taPanel.classList.remove('hidden');
            else taPanel.classList.add('hidden');
        }


        updateHUD(0);
        this.sound.stopAll(); // 一旦全部止める


        const sNum = parseInt(currentStageId.replace('stage', ''));
        if (this.cache.audio.exists(`bgm_stage${sNum}`)) {
            this.sound.play(`bgm_stage${sNum}`, { loop: true, volume: 0.5 });
        }

        this.isGameOver = false; this.isPaused = false; this.isStageClearing = false; this.score = 0; 
        this.player = null; this.goal = null; this.cell = 36;
        document.getElementById('chips-count').innerText = 0;
        document.getElementById('current-stage').innerText = currentStageId.replace('stage', '');
        document.getElementById('pause-overlay').classList.add('hidden');

        // ゲーム開始時にHUDを確実に表示する
        updateHUD(0);


        const sNumInt = parseInt(currentStageId.replace('stage', ''));
        this.dialogueQueue = (typeof stageDialogueData !== 'undefined' && stageDialogueData[sNumInt]) ? JSON.parse(JSON.stringify(stageDialogueData[sNumInt])) : [];
        this.dialogueQueue.forEach(d => d.played = false);
        const stage = stages[currentStageId] || stages["stage1"];
        const rawRows = stage.csv.split(/\r?\n/).map(row => row.split(','));
        const maxCols = Math.max(...rawRows.map(r => r.length));
        // 全ての行の長さを maxCols に揃える（足りない分は空文字で埋める）
        const csvRows = rawRows.map(row => {
            while (row.length < maxCols) row.push('');
            return row;
        });
        this.csvRows = csvRows;
        const worldWidth = maxCols * this.cell;
        this.cameras.main.setBounds(0, -300, worldWidth, 900);
        this.physics.world.setBounds(0, -1000, worldWidth, 3000);
        const { width, height } = this.cameras.main;
        const bgKey = `bg_stage${sNumInt}`;
        if (this.textures.exists(bgKey)) {
            const bg = this.add.image(width / 2, height / 2, bgKey).setOrigin(0.5, 0.5).setScrollFactor(0);
            // ズームを引いても端が見えないよう、画面サイズに対して少し余裕を持ってスケーリングするぜ！！
            const scale = Math.max(width / bg.width, height / bg.height) / 0.8; 
            bg.setScale(scale);
        } else {

            this.add.rectangle(worldWidth/2, height / 2, worldWidth, height, 0x87ceeb).setScrollFactor(0.5);
        }

        this.platforms = this.physics.add.staticGroup();
        this.chips = this.physics.add.group({ allowGravity: false, immovable: true });
        this.enemies = this.physics.add.group();
        if (!this.textures.exists('block')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0x6b4423, 1); g.fillRect(0, 0, 36, 36);
            g.lineStyle(2, 0x4d2e16, 1); g.strokeRect(1, 1, 34, 34);
            g.generateTexture('block', 36, 36);
        }
        if (!this.textures.exists('slippery')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xffd700, 1); g.fillRect(0, 0, 36, 36);
            g.fillStyle(0xffffff, 0.5); g.fillRect(5, 5, 26, 5);
            g.generateTexture('slippery', 36, 36);
        }
        if (!this.textures.exists('bouncy')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xff69b4, 1); g.fillRect(0, 0, 36, 36);
            g.lineStyle(2, 0xffffff, 1); g.strokeRect(2, 2, 32, 32);
            g.generateTexture('bouncy', 36, 36);
        }
        if (!this.textures.exists('hazard')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0x32cd32, 1); g.fillRect(0, 0, 36, 36);
            g.fillStyle(0x006400, 1); g.beginPath(); g.moveTo(0, 36); g.lineTo(18, 0); g.lineTo(36, 36); g.closePath(); g.fill();
            g.generateTexture('hazard', 36, 36);
        }
        if (!this.textures.exists('flag')) {
            const f = this.make.graphics({ x: 0, y: 0, add: false });
            f.fillStyle(0x808080, 1); f.fillRect(0, 0, 8, 120);
            f.fillStyle(0xff0000, 1); f.fillRect(8, 0, 60, 45);
            f.generateTexture('flag', 68, 120);
        }
        if (currentStageId === "stage5") this.physics.world.gravity.y = 800; // ボス戦用に少し軽く
        else this.physics.world.gravity.y = 1400;
        
        this.projectiles = this.physics.add.group();
        this.boss = null;
        this.physics.world.TILE_BIAS = 32;
        const rowOffset = -4;
        csvRows.forEach((row, rowIndex) => {
            row.forEach((char, colIndex) => {
                const x = colIndex * this.cell, y = (rowIndex + rowOffset) * this.cell;
                if (char === 'G') this.platforms.create(x, y, 'block').setOrigin(0, 0).refreshBody();
                else if (char === 'S') { const s = this.platforms.create(x, y, 'slippery').setOrigin(0, 0).refreshBody(); s.isSlippery = true; }
                else if (char === 'B') {
                    const b = this.platforms.create(x, y, 'bouncy').setOrigin(0, 0).refreshBody();
                    b.isBouncy = true;
                }
                else if (char === 'N') {
                    const beef = this.enemies.create(x + 18, y + 36, 'beef');
                    beef.setOrigin(0.5, 1).setDisplaySize(85, 85).setCollideWorldBounds(true);
                    // 内部のテクスチャサイズ（256x256）に合わせてオフセットを厳密に計算
                    // 見た目の 85px に対して、判定を 75x85 にする
                    const ratio = beef.width / 85; 
                    beef.body.setSize(75 * ratio, 85 * ratio);
                    beef.body.setOffset((beef.width - 75 * ratio) / 2, beef.height - 85 * ratio);
                    beef.type = 'beef'; beef.isCharging = false;
                }
                else if (char === 'H') { const h = this.platforms.create(x, y, 'hazard').setOrigin(0, 0).refreshBody(); h.isHazard = true; }
                else if (char === 'C') {
                    const chip = this.chips.create(x + 18, y + 18, 'chip').setDisplaySize(43, 43);
                    // ポテチも比率計算を導入して、見た目通りの 35x35 判定にするぜ！
                    const cRatio = chip.width / 43;
                    chip.body.setSize(35 * cRatio, 35 * cRatio);
                    chip.body.setOffset((chip.width - 35 * cRatio) / 2, (chip.height - 35 * cRatio) / 2);
                }
                else if (char === 'E') {
                    const e = this.enemies.create(x + 18, y + 36, 'enemy');
                    e.setOrigin(0.5, 1).setDisplaySize(65, 65).setCollideWorldBounds(true).setVelocityX(-100);
                    // 内部テクスチャサイズと表示サイズの比率を考慮して、55x60 の判定を適用
                    const eRatio = e.width / 65;
                    e.body.setSize(55 * eRatio, 60 * eRatio);
                    e.body.setOffset((e.width - 55 * eRatio) / 2, e.height - 60 * eRatio);
                    e._groundRow = rowIndex + 1;
                } else if (char === 'P') {
                    if (!this.player) {
                        this.player = this.physics.add.sprite(x + 36, y + 36, 'cyori_0');
                        this.player.setDisplaySize(65, 75);
                        if (!this.anims.exists('walk')) {
                            this.anims.create({ key: 'idle', frames: [{ key: 'cyori_0' }, { key: 'cyori_1' }, { key: 'cyori_2' }, { key: 'cyori_3' }], frameRate: 4, repeat: -1 });
                            this.anims.create({ key: 'walk', frames: [{ key: 'cyori_4' }, { key: 'cyori_5' }, { key: 'cyori_6' }, { key: 'cyori_7' }], frameRate: 10, repeat: -1 });
                            this.anims.create({ key: 'jump_up', frames: [{ key: 'cyori_8' }, { key: 'cyori_9' }], frameRate: 8 });
                            this.anims.create({ key: 'fall', frames: [{ key: 'cyori_10' }, { key: 'cyori_11' }], frameRate: 8 });
                        }
                        this.player.play('idle');
                        const bW = this.player.width * 0.55;
                        const bH = this.player.height * 0.95;
                        this.player.body.setSize(bW, bH);
                        this.player.body.setOffset((this.player.width - bW) / 2, this.player.height - bH);
                    }
                } else if (char === 'Z') {
                    this.boss = this.physics.add.sprite(x + 18, y, 'yuno');
                    this.boss.setOrigin(0.5, 1).setDisplaySize(80, 80).setCollideWorldBounds(true).setBounce(0.1);
                    this.boss.body.setSize(550, 1024); 
                    this.boss.body.setOffset(237, 0); 
                    this.boss.body.setAllowGravity(true); 
                    this.boss.hp = 3; this.boss.lastShoot = 0; this.boss.moveDir = -1; this.boss.lastFlip = 0;
                    this.boss.active = true;
                } else if (char === 'X' && !this.goal) {
                    this.goal = this.physics.add.staticSprite(x, y, 'flag').setOrigin(0, 0);
                    // 旗の見た目（68x120）に合わせて、自然なサイズに調整
                    this.goal.body.setSize(70, 120);
                    this.goal.body.setOffset(0, 0);
                    this.goal.refreshBody();
                    if (currentStageId === "stage5") {
                        this.goal.setAlpha(0.3); // ボス戦では最初は半透明
                    } else {
                        this.goal.setAlpha(1); // 他のステージは最初から不透明
                    }
                }
            });
        });
        this.chipsTotal = this.chips.getChildren().length;
        document.getElementById('total-chips').innerText = this.chipsTotal;
        if (this.player) {
            // ちょりがスマホのボタンに隠れないよう、カメラの注視点を大幅に上(-120)にずらすぜ！！
            this.cameras.main.startFollow(this.player, true, 0.1, 0.1, 0, -120);
            // 高解像度対応に伴い、ズームを1.25倍に引き上げて、ちょりの勇姿をハッキリ見せるぜ！！
            const zoomLevel = window.innerWidth < 850 ? 1.25 : 1.5;
            this.cameras.main.setZoom(zoomLevel);
        }

        this.physics.add.collider(this.player, this.platforms, (p, obj) => {
            if (obj.isBouncy && p.body.touching.down) p.setVelocityY(-1000);
            if (obj.isHazard && !this.isGameOver) { this.isGameOver = true; this.physics.pause(); showDialogue("ワサビが鼻にツーンときたわ！"); setTimeout(() => this.scene.restart(), 1000); }
            p._onSlippery = obj.isSlippery;
        });
        this.physics.add.collider(this.enemies, this.platforms);
        if (this.boss) {
            this.physics.add.collider(this.boss, this.platforms);
            this.physics.add.overlap(this.player, this.boss, (p, b) => {
                if (this.isGameOver || b.isInvulnerable) return;
                const isStomp = p.y < b.y - 10;
                if (isStomp) {
                    b.hp--;
                    b.isInvulnerable = true;
                    this.tweens.add({
                        targets: b,
                        alpha: 0.3,
                        tint: 0xff0000,
                        duration: 100,
                        yoyo: true,
                        repeat: 4,
                        onComplete: () => {
                            b.isInvulnerable = false;
                            b.clearTint();
                            b.setAlpha(1);
                        }
                    });
                    p.setVelocityY(-550);
                    let bossMsg = "";
                    if (b.hp === 2) bossMsg = "な、何するのよ！無礼者！";
                    else if (b.hp === 1) bossMsg = "あいたた……っ！よくもやってくれたわね！";
                    else bossMsg = "わたくしが……負けるなんて……ありえないわぁ〜〜！！";
                    showDialogue(bossMsg, "Yuno");
                    if (b.hp <= 0) {
                        b.disableBody(true, true);
                        if (this.goal) { 
                            this.goal.setAlpha(1); // ゴールを実体化
                            this.tweens.add({ targets: this.goal, scaleX: 1.2, scaleY: 1.2, duration: 200, yoyo: true }); // キラリと光る演出
                            showDialogue("や～っと終わったぁ、何がしたかったんやろ？"); 
                        }
                    }
                } else {
                    this.isGameOver = true; this.physics.pause(); showDialogue("あかん！捕まってもうた！"); setTimeout(() => this.scene.restart(), 1000);
                }
            });
        }
        this.physics.add.collider(this.projectiles, this.platforms, (proj) => proj.destroy());
        this.physics.add.overlap(this.player, this.projectiles, (p, proj) => {
            if (!this.isGameOver) { proj.destroy(); this.isGameOver = true; this.physics.pause(); showDialogue("熱っ！火の玉飛んできたわ！"); setTimeout(() => this.scene.restart(), 1000); }
        });
        this.physics.add.overlap(this.player, this.chips, (p, c) => {
            c.disableBody(true, true);
            this.score++;
            document.getElementById('chips-count').innerText = this.score;
        });
        this.physics.add.overlap(this.player, this.goal, () => {
            // ボス戦の場合は、ボスを倒した後（不透明になった後）だけ判定を有効にする
            if (currentStageId === "stage5") {
                if (this.goal.alpha < 1) return;
            }

            // まだ接触判定中ならスキップ
            if (this.isStageClearing) return;
            this.isStageClearing = true;

            const isPerfect = (this.score >= this.chipsTotal && this.chipsTotal > 0);
            
            if (isTimeAttack && !isPerfect) {
                showDialogue("あかん！ポテチ全部集めてないやんか！やり直しや！！");
                setTimeout(() => {
                    this.isStageClearing = false;
                    this.scene.restart();
                }, 1500);
                return;
            }

            stageProgress[currentStageId].cleared = true;
            this.physics.pause();

            if (isPerfect) {
                stageProgress[currentStageId].perfect = true;
                showDialogue("よっしゃパーフェクト！伝説のパッケージ完成や！！");
                // 最終ステージクリアならタイマー停止
                if (currentStageId === "stage5") {
                    // タイマーは update で止まるようにする
                }
                setTimeout(() => showClearScreen(stages[currentStageId].bag, this), 1500);
            } else {
                showDialogue("クリア！でもまだポテチ残っとるわ……。次は全部集めな！");
                setTimeout(() => {
                    if (currentStageId === "stage5") startEnding();
                    else this.scene.start('WorldMapScene');
                }, 2500);
            }
        });

        this.physics.add.collider(this.player, this.enemies, (p, e) => {
            if (e.body.touching.up) { e.disableBody(true, true); p.setVelocityY(-400); }
            else if (!this.isGameOver) { this.isGameOver = true; this.physics.pause(); showDialogue("あかん！やり直しや！"); setTimeout(() => this.scene.restart(), 1000); }
        });
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.dashKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        // スマホ用ポーズボタン
        const pauseBtn = document.getElementById('btn-pause');
        if (pauseBtn) {
            const handlePause = (e) => {
                if (e) e.preventDefault();
                togglePause(this);
            };
            pauseBtn.onclick = handlePause;
            pauseBtn.ontouchend = handlePause;
        }

        // ポーズ画面内のボタン
        const resumeBtn = document.getElementById('resume-btn');
        if (resumeBtn) {
            const handleResume = (e) => {
                if (e) e.preventDefault();
                togglePause(this);
            };
            resumeBtn.onclick = handleResume;
            resumeBtn.ontouchend = handleResume;
        }
        
        const pauseExitBtn = document.getElementById('pause-exit-btn');
        if (pauseExitBtn) {
            const handleExit = (e) => {
                if (e) e.preventDefault();
                togglePause(this);
                this.scene.start('WorldMapScene');
            };
            pauseExitBtn.onclick = handleExit;
            pauseExitBtn.ontouchend = handleExit;
        }


    }
    update(time, delta) {
        if (isTimeAttack && !this.isPaused && !this.isStageClearing) {
            taElapsedTime = Date.now() - taStartTime;
            const timerEl = document.getElementById('ta-timer');
            if (timerEl) timerEl.innerText = formatTime(taElapsedTime);
        }

        if (Phaser.Input.Keyboard.JustDown(this.pauseKey) || Phaser.Input.Keyboard.JustDown(this.escKey)) togglePause(this);
        if (this.isPaused || !this.player || !this.player.body) return;

        const isDashing = this.dashKey.isDown || mobileInput.dash;
        const speed = isDashing ? 350 : 220;
        const accel = this.player._onSlippery ? 2 : 50;
        if (this.cursors.left.isDown || this.wasd.A.isDown || mobileInput.left) { 
            this.player.setVelocityX(Phaser.Math.Linear(this.player.body.velocity.x, -speed, accel/100));
            this.player.setFlipX(true);
        } else if (this.cursors.right.isDown || this.wasd.D.isDown || mobileInput.right) { 
            this.player.setVelocityX(Phaser.Math.Linear(this.player.body.velocity.x, speed, accel/100));
            this.player.setFlipX(false);
        } else { 
            const friction = this.player._onSlippery ? 0.995 : 0.8;
            this.player.setVelocityX(this.player.body.velocity.x * friction);
            if (Math.abs(this.player.body.velocity.x) < 5) this.player.setVelocityX(0);
        }
        const vy = this.player.body.velocity.y;
        const vx = Math.abs(this.player.body.velocity.x);
        const onGround = this.player.body.touching.down || this.player.body.blocked.down;
        if (!onGround && Math.abs(vy) > 150) {
            if (vy < 0) { if (this.player.anims.currentAnim?.key !== 'jump_up') this.player.play('jump_up'); }
            else { if (this.player.anims.currentAnim?.key !== 'fall') this.player.play('fall'); }
        } else if (vx > 20) { if (this.player.anims.currentAnim?.key !== 'walk') this.player.play('walk'); }
        else { if (this.player.anims.currentAnim?.key !== 'idle') this.player.play('idle'); }
        this.player.angle = 0;
        this.player.body.setAllowRotation(false);
        if ((this.cursors.up.isDown || this.wasd.W.isDown || mobileInput.jump) && (this.player.body.touching.down || this.player.body.blocked.down)) {
            this.player.setVelocityY(currentStageId === "stage5" ? -450 : -640);
        }
        this.dialogueQueue.forEach(d => { 
            if (!d.played && this.player.x >= d.x) { 
                d.played = true; 
                // 全回収チェック (現在の獲得数 >= ステージの総数)
                const isPerfect = (this.score >= this.chipsTotal && this.chipsTotal > 0);
                const msg = (isPerfect && d.perfectText) ? d.perfectText : d.text;
                showDialogue(msg, d.speaker || 'Cyori'); 
            } 
        });
        const now = Date.now();
        if (this.boss && this.boss.active) {
            const b = this.boss;
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, b.x, b.y);
            const checkX = b.x + (b.moveDir * 50);
            const checkCol = Math.floor(checkX / 36);
            const gr = Math.floor((b.y + 2) / 36) + 1;
            const hasGround = this.csvRows[gr] && ['G','S','B','H'].includes(this.csvRows[gr][checkCol]);
            if (now - b.lastFlip > 500 && (!hasGround || b.body.blocked.left || b.body.blocked.right)) { b.moveDir *= -1; b.lastFlip = now; }
            b.setVelocityX(b.moveDir * 100); b.setFlipX(b.moveDir > 0);
            if (b.body.blocked.down && Math.random() < 0.01) b.setVelocityY(-400);
            if (dist < 500 && now - b.lastShoot > 2000) {
                b.lastShoot = now;
                const proj = this.projectiles.create(b.x, b.y - 50, 'soul_fire');
                proj.setDisplaySize(30, 30).setCircle(10);
                proj.body.setAllowGravity(false);
                const shootDir = (this.player.x < b.x) ? -1 : 1;
                proj.setVelocity(shootDir * 400, 0);
                // オレンジ色の輝きを活かすためティントを削除！！

            }
        }
        this.enemies.children.iterate(e => {
            if (!e || !e.body || !e.body.enable) return;
            if (e.type === 'beef') {
                const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y);
                if (!e.isCharging && dist < 300) {
                    e.isCharging = true;
                    const dir = (this.player.x < e.x) ? -1 : 1;
                    e.setVelocityX(dir * 350); e.setFlipX(dir < 0); e.setTint(0xff5555);
                } else if (!e.isCharging) { e.setVelocityX(0); }
                if (e.body.blocked.left || e.body.blocked.right) { e.setVelocityX(-e.body.velocity.x); e.setFlipX(e.body.velocity.x < 0); }
            } else {
                if (e.body.velocity.x !== 0) e._lastDir = e.body.velocity.x;
                if (e.body.velocity.x === 0) { e.setVelocityX((e._lastDir || -100) > 0 ? -100 : 100); e._lastReverse = now; return; }
                const goingRight = e.body.velocity.x > 0;
                const checkCol = Math.floor((goingRight ? e.x + 36 : e.x - 36) / 36);
                const gr = e._groundRow || 19;
                const isPlatform = (c) => ['G', 'S', 'B', 'H'].includes(c);
                const hasGround = isPlatform(this.csvRows[gr] ? this.csvRows[gr][checkCol] : '');
                const hasWall = isPlatform(this.csvRows[gr - 1] ? this.csvRows[gr - 1][checkCol] : '');
                if ((!hasGround || hasWall) && now - (e._lastReverse || 0) > 300) {
                    e.setVelocityX(-e.body.velocity.x); e._lastReverse = now; e.setFlipX(e.body.velocity.x > 0);
                }
            }
        });
        if (this.player.y > 800 && !this.isGameOver) { this.isGameOver = true; this.physics.pause(); showDialogue("落ちた！"); setTimeout(() => this.scene.restart(), 1000); }
    }
}

function initGame() {
    if (phaserGame) return;
    const config = {
        type: Phaser.AUTO, // WebGL優先で高画質に！！
        parent: 'game-container',
        scale: {
            mode: Phaser.Scale.FIT, // スマホの画面に完璧に合わせる
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: window.innerWidth * window.devicePixelRatio,
            height: window.innerHeight * window.devicePixelRatio,
        },
        physics: { default: 'arcade', arcade: { gravity: { y: 1400 }, debug: false } },
        render: { 
            pixelArt: true, // キャラはドットを活かす！！
            antialias: true, // 文字の歪みを防ぐ！！
            roundPixels: true 
        },
        scene: [BootScene, WorldMapScene, PlayScene]
    };
    phaserGame = new Phaser.Game(config);
}


window.onload = () => { initMobileControls(); initGame(); };

const openingScript = [
    { img: 'story_sleeping', text: "「ふぁあ……今日はええ天気やなぁ。昼寝日和やわ……」" },
    { img: 'story_theft', text: "しかし、ちょりが熟睡している隙に、怪しい影が忍び寄る……。" },
    { img: 'story_theft', text: "戸棚にあった大事なポテチ（うすしお味）が盗まれてしまった！" },
    { img: 'story_angry', text: "「なんやて！？あたしのポテチがあらへん！誰や、勝手に持ってったんは！！」" },
    { img: 'story_angry', text: "「許さへんで！一枚残らず取り返したるから覚悟しときや！！」" }
];
const endingScript = [
    { img: 'yuno', text: "yuno「仕事中に、Cyoriにポテチ集めさせるアクションゲーム作ったら面白そうだなってイメージがわいてきたんだけど……」" },
    { img: 'yuno', text: "yuno「肝心のポテチを集める目的が思いつかなかったからとりあえず、ポテチ奪ってここまで取り戻させに来ようと考えたのよ」" },
    { img: 'yuno', text: "yuno「奪ったポテチは大切に保管してあるから返すね。ゲームクリアおめでとう!!」" },
    { img: 'cyori_0', text: "ちょり「……いや、仕事しなはれ！！動機が雑すぎるわ！！」" },
    { img: 'story_ending_peace', text: "こうして、奪われたポテチは無事（？）ちょりの元へ。ちょりの大冒険はおしまい！お疲れ様でした！" }
];

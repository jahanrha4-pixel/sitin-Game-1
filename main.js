/* =========================================================
   SITIN — App Bootstrap
   ========================================================= */

let currentView = "dashboard";

function switchView(view){
  currentView = view;
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.getElementById("view-"+view).classList.add("active");
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });
  document.getElementById("content").scrollTo({top:0, behavior:"instant"});
}

function wireNav(){
  document.querySelectorAll(".nav-item[data-view]").forEach(btn => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });
}

function startApp(state){
  GAME = state;
  document.getElementById("bootScreen").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  wireNav();
  switchView("dashboard");
  renderAll(GAME);

  document.getElementById("btnEndTurn").addEventListener("click", () => {
    const result = endTurn(GAME);
    renderAll(GAME);
    switchView(currentView);
    notify(result.net>=0?"success":"warning", "⏱️", `نوبت پایان یافت — درآمد خالص: ${formatMoney(result.net)}`);
  });
}

function initBoot(){
  const hasSave = hasSavedGame();
  const btnContinue = document.getElementById("btnContinue");
  const btnNew = document.getElementById("btnNewGame");
  const importInput = document.getElementById("importFile");

  if (hasSave){
    btnContinue.style.display = "inline-flex";
    btnContinue.addEventListener("click", () => {
      const loaded = loadGame();
      startApp(loaded || createNewGame());
    });
  }

  btnNew.addEventListener("click", () => {
    if (hasSave){
      openModal(`
        <h3>🌍 شروع بازی جدید</h3>
        <p style="font-size:13px; color:var(--text-muted);">یک بازی ذخیره‌شده وجود دارد. شروع بازی جدید آن را حذف می‌کند. ادامه می‌دهید؟</p>
        <div class="modal-actions">
          <button class="btn btn-outline btn-block" id="cancelNew">انصراف</button>
          <button class="btn btn-crimson btn-block" id="confirmNew">شروع جدید</button>
        </div>
      `);
      document.getElementById("cancelNew").addEventListener("click", closeModal);
      document.getElementById("confirmNew").addEventListener("click", () => {
        closeModal();
        const fresh = createNewGame();
        saveGame(fresh);
        startApp(fresh);
      });
    } else {
      const fresh = createNewGame();
      saveGame(fresh);
      startApp(fresh);
    }
  });

  importInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    importSaveFromFile(file, (state, err) => {
      if (err){ alert("فایل ذخیره نامعتبر است."); return; }
      saveGame(state);
      startApp(state);
    });
  });
}

document.addEventListener("DOMContentLoaded", initBoot);

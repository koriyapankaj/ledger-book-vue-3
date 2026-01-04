import { defineStore } from 'pinia';
import { ref } from 'vue';

const SIDEBAR_KEY = 'ledger_book_sidebar_collapsed';

export const useSidebarStore = defineStore('sidebar', () => {
  const isCollapsed = ref(false);

  function initialize() {
    const stored = localStorage.getItem(SIDEBAR_KEY);
    isCollapsed.value = stored === 'true';
  }

  function toggle() {
    isCollapsed.value = !isCollapsed.value;
    localStorage.setItem(SIDEBAR_KEY, isCollapsed.value.toString());
  }

  function setCollapsed(value: boolean) {
    isCollapsed.value = value;
    localStorage.setItem(SIDEBAR_KEY, value.toString());
  }

  return {
    isCollapsed,
    initialize,
    toggle,
    setCollapsed,
  };
});
import { defineStore } from "pinia";
import { Ref, ref } from "vue";
import {
  KeyMapping,
  KeyMappingConfig,
  KeySteeringWheel,
} from "../keyMappingConfig";
import { Store } from "@tauri-apps/plugin-store";

const localStore = new Store("store.bin");

export const useGlobalStore = defineStore("global", () => {
  const showLoadingRef = ref(false);
  function showLoading() {
    showLoadingRef.value = true;
  }
  function hideLoading() {
    showLoadingRef.value = false;
  }

  interface ControledDevice {
    scid: string;
    deviceName: string;
    deviceID: string;
  }

  const controledDevice: Ref<ControledDevice | null> = ref(null);
  const editKeyMappingList: Ref<KeyMapping[]> = ref([]);

  const showInputBox: (_: boolean) => void = (_: boolean) => {};

  let checkUpdate: () => Promise<void> = async () => {};

  function applyEditKeyMappingList(): boolean {
    const set = new Set<string>();
    for (const keyMapping of editKeyMappingList.value) {
      if (keyMapping.type === "SteeringWheel") {
        const nameList: ["up", "down", "left", "right"] = [
          "up",
          "down",
          "left",
          "right",
        ];
        for (const name of nameList) {
          if (set.has((keyMapping as KeySteeringWheel).key[name])) return false;
          set.add((keyMapping as KeySteeringWheel).key[name]);
        }
      } else {
        if (set.has(keyMapping.key as string)) return false;
        set.add(keyMapping.key as string);
      }
    }

    keyMappingConfigList.value[curKeyMappingIndex.value].list =
      editKeyMappingList.value;
    localStore.set("keyMappingConfigList", keyMappingConfigList.value);
    return true;
  }

  function resetEditKeyMappingList() {
    editKeyMappingList.value = JSON.parse(
      JSON.stringify(keyMappingConfigList.value[curKeyMappingIndex.value].list)
    );
  }

  function setKeyMappingIndex(index: number) {
    curKeyMappingIndex.value = index;
    resetEditKeyMappingList();
    localStore.set("curKeyMappingIndex", index);
  }

  // persistent storage
  const screenSizeW: Ref<number> = ref(0);
  const screenSizeH: Ref<number> = ref(0);
  const keyMappingConfigList: Ref<KeyMappingConfig[]> = ref([]);
  const curKeyMappingIndex = ref(0);
  const maskButton = ref({
    transparency: 0.5,
    show: true,
  });
  const checkUpdateAtStart = ref(true);

  return {
    // persistent storage
    screenSizeW,
    screenSizeH,
    keyMappingConfigList,
    curKeyMappingIndex,
    maskButton,
    checkUpdateAtStart,
    // in-memory storage
    showLoading,
    hideLoading,
    showLoadingRef,
    controledDevice,
    editKeyMappingList,
    showInputBox,
    applyEditKeyMappingList,
    resetEditKeyMappingList,
    setKeyMappingIndex,
    checkUpdate,
  };
});

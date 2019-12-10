import { writable, get, derived } from "svelte/store";

export const filterStore = writable({
  sample_id: { value: "", keys: ["sample_id"] },
  head_chest_id: { value: "", keys: ["head_chest_id"] },
  head_chest_perserve_way: { value: "", keys: ["head_chest_preserve_way"] },
  abdomen_id: { value: "", keys: ["abdomen_id"] },
  abdomen_preserve_way: { value: "", keys: ["abdomen_preserve_way"] },
  gut_id: { value: "", keys: ["gut_id"] },
  gut_id_preserve_way: { value: "", keys: ["gut_id_preserve_way"] },
  isolated_strain_or_not: { value: "", keys: ["isolated_strain_or_not"] },
  leg_id: { value: "", keys: ["leg_id"] },
  leg_id_preserve_way: { value: "", keys: ["leg_id_preserve_way"] },
  used_or_not: { value: "", keys: ["used_or_not"] },
  dissection_state: { value: "", keys: ["dissection_state"] },
  multi_sample_one_tube_or_not: {
    value: "",
    keys: ["multi_sample_one_tube_or_not"]
  },
  sample_barcode: { value: "", keys: ["sample_barcode"] },
  box_id: { value: "", keys: ["box_id"] },
  sample_collector: { value: "", keys: ["sample_collector"] },
  sample_collection_date: { value: "", keys: ["sample_collection_date"] },
  bee_type: { value: "", keys: ["bee_type"] },
  life_style: { value: "", keys: ["life_style"] },
  life_stage: { value: "", keys: ["life_stage"] },
  beekeepers: { value: "", keys: ["beekeepers"] },
  filed_id: { value: "", keys: ["filed_id"] },
  field_box_id: { value: "", keys: ["field_box_id"] },
  bost_origin: { value: "", keys: ["bost_origin"] },
  frame_year: { value: "", keys: ["frame_year"] },
  decapping_frequency: { value: "", keys: ["decapping_frequency"] },
  sucrose_or_not: { value: "", keys: ["sucrose_or_not"] },
  sucroese_notes: { value: "", keys: ["sucroese_notes"] },
  habitat: { value: "", keys: ["habitat"] },
  presticide_or_not: { value: "", keys: ["presticide_or_not"] },
  flower_species: { value: "", keys: ["flower_species"] },
  identifier_name: { value: "", keys: ["identifier_name"] },
  identifier_email: { value: "", keys: ["identifier_email"] },
  identifier_institution: { value: "", keys: ["identifier_institution"] },
  phylum: { value: "", keys: ["phylum"] },
  class_evolution: { value: "", keys: ["class_evolution"] },
  order: { value: "", keys: ["order"] },
  family: { value: "", keys: ["family"] },
  subfamily: { value: "", keys: ["subfamily"] },
  genus: { value: "", keys: ["genus"] },
  species: { value: "", keys: ["species"] },
  subspecies: { value: "", keys: ["subspecies"] },
  breed: { value: "", keys: ["breed"] },
  continent_or_ocean: { value: "", keys: ["continent_or_ocean"] },
  country: { value: "", keys: ["country"] },
  state_or_province: { value: "", keys: ["state_or_province"] },
  city: { value: "", keys: ["city"] },
  county: { value: "", keys: ["county"] },
  exact_site: { value: "", keys: ["exact_site"] },
  latitude: { value: "", keys: ["latitude"] },
  longitude: { value: "", keys: ["longitude"] },
  elevation: { value: "", keys: ["elevation"] },
  sample_notes: { value: "", keys: ["sample_notes"] }
});

export const getStore = () => {
  const state = {
    selectedRows: writable([]),
    selectionMode: writable("single"),
    customSelection: writable(null),
    selectedClass: writable(null),
    hideSortIcons: writable(null),
    sortId: writable(null),
    sortKey: writable(null),
    customSort: writable(null),
    sortOrder: writable(null),
    currentPage: writable(-1),
    totalPages: writable(-1)
  };

  const actions = {
    selectRow(row) {
      if (get(state.selectionMode) === "single") {
        state.selectedRows.set([row]);
      }

      let selected = get(state.selectedRows);
      const index = selected.indexOf(row);
      if (index === -1) {
        state.selectedRows.set([...selected, row]);
      }
    },
    selectRows(rows) {
      for (let row of rows) {
        actions.selectRow(row);
      }
    },
    deselectRow(row) {
      let selected = get(state.selectedRows);
      const index = selected.indexOf(row);

      if (index > -1) {
        selected = selected.splice(index, 1);
        state.selectedRows.set(selected);
      }
    },
    deselectRows(rows) {
      for (let row of rows) {
        actions.deselectRow(row);
      }
    },
    selectAll(all) {
      state.selectedRows.set(all);
    },
    deselectAll() {
      state.selectedRows.set([]);
    },
    setSort({ sortKey, customSort, sortOrder, sortId }) {
      state.sortKey.set(sortKey);
      state.customSort.set(customSort);
      state.sortOrder.set(sortOrder);
      state.sortId.set(sortId);
    }
  };

  return {
    ...state,
    ...actions
  };
};

<script>
  import STable from "./STable.svelte";
  import STh from "./STh.svelte";
  import STr from "./STr.svelte";
  import SPagination from "./SPagination.svelte";
  import { doFilter, exportExcel } from "./table-utils.js";
  import { onMount } from "svelte";

  //   import FilterSampleStore from "./FilterSampleStore.svelte";
  //   import FilterSampleBackground from "./FilterSampleBackground.svelte";
  //   import FilterSampleEvolution from "./FilterSampleEvolution.svelte";
  //   import FilterSampleGeo from "./FilterSampleGeo.svelte";

  export let name;

  const apiURL = "http://127.0.0.1:8000/api/samples/";
  const fakeURL = "https://jsonplaceholder.typicode.com/photos";
  let data = [];
  let totalNum;
  onMount(async function() {
    const response = await fetch(apiURL);
    data = await response.json();
    console.log(data);
  });

  let displayStore = true;
  let displayBackground = true;
  let displayEvo = true;
  let displayGeo = true;
  let columns = [
    "sample_id",
    "head_chest_id",
    "head_chest_perserve_way",
    "abdomen_id",
    "abdomen_preserve_way",
    "gut_id",
    "gut_id_preserve_way",
    "isolated_strain_or_not",
    "leg_id",
    "leg_id_preserve_way",
    "used_or_not",
    "dissection_state",
    "multi_sample_one_tube_or_not",
    "sample_barcode",
    "box_id",
    "sample_collector",
    "sample_collection_date",
    "bee_type",
    "life_style",
    "life_stage",
    "beekeepers",
    "filed_id",
    "field_box_id",
    "bost_origin",
    "frame_year",
    "decapping_frequency",
    "sucrose_or_not",
    "sucroese_notes",
    "habitat",
    "presticide_or_not",
    "flower_species",
    "identifier_name",
    "identifier_email",
    "identifier_institution",
    "phylum",
    "class_evolution",
    "order",
    "family",
    "subfamily",
    "genus",
    "species",
    "subspecies",
    "breed",
    "continent_or_ocean",
    "country",
    "state_or_province",
    "city",
    "county",
    "exact_site",
    "latitude",
    "longitude",
    "elevation",
    "sample_notes"
  ];

  let filters = {
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
  };

  $: filteredData =
    data.length === 0
      ? []
      : typeof filters !== "object"
      ? data
      : doFilter(data, filters);

  $: totalNum = filteredData.length;

  $: console.log(filteredData);

  let pageSize = 5;
  let totalPages = 0;
  let currentPage = 1;

  function totalPagesChanged(e) {
    totalPages = e.detail;
  }
</script>

<style>

</style>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" />
  <link
    href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css"
    rel="stylesheet" />
</svelte:head>

<div class="bg-yellow-100 text-center font-bold text-xl my-4">
  符合筛选条件的一共有
  <span class="text-5xl text-purple-500">{totalNum}</span>
  条记录
</div>

<div class="flex flex-wrap mx-3 mt-4 mb-2">
  <div class="md:w-1/4 max-w-sm">
    <!-- <FilterSampleStore {filters} /> -->

    <div
      class="bg-teal-100 border-t-4 border-teal-500 rounded-b text-teal-900 px-4
      py-3 shadow-md my-2 ml-2 mr-3 text-center h-24">
      <p class="text-sm font-bold">样本保存条件</p>
      <p class="text-xs">是否分菌等判断，用true， false筛选</p>
    </div>

    <form class="w-full max-w-sm text-xs">

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-teal-700 md:text-right mb-1 md:mb-0 pr-4">
            样本ID
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-teal-500"
            type="text"
            bind:value={filters.sample_id.value}
            placeholder="样本ID" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-teal-700 md:text-right mb-1 md:mb-0 pr-4">
            头胸部ID
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-teal-500"
            type="text"
            bind:value={filters.head_chest_id.value}
            placeholder="头胸部ID" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-teal-700 md:text-right mb-1 md:mb-0 pr-4">
            头胸部保存
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-teal-500"
            type="text"
            bind:value={filters.head_chest_perserve_way.value}
            placeholder="头胸部保存" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-teal-700 md:text-right mb-1 md:mb-0 pr-4">
            腹部ID
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-teal-500"
            type="text"
            bind:value={filters.abdomen_id.value}
            placeholder="腹部ID" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-teal-700 md:text-right mb-1 md:mb-0 pr-4">
            腹部保存
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-teal-500"
            type="text"
            bind:value={filters.abdomen_preserve_way.value}
            placeholder="腹部保存" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-teal-700 md:text-right mb-1 md:mb-0 pr-4">
            肠道ID
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-teal-500"
            type="text"
            bind:value={filters.gut_id.value}
            placeholder="肠道ID" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-teal-700 md:text-right mb-1 md:mb-0 pr-4">
            肠道保存
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-teal-500"
            type="text"
            bind:value={filters.gut_id_preserve_way.value}
            placeholder="肠道保存" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-teal-700 md:text-right mb-1 md:mb-0 pr-4">
            腿部ID
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-teal-500"
            type="text"
            bind:value={filters.leg_id.value}
            placeholder="腿部ID" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-teal-700 md:text-right mb-1 md:mb-0 pr-4">
            腿部保存
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-teal-500"
            type="text"
            bind:value={filters.leg_id_preserve_way.value}
            placeholder="腿部保存" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-teal-700 md:text-right mb-1 md:mb-0 pr-4">
            解剖前状态
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-teal-500"
            type="text"
            bind:value={filters.dissection_state.value}
            placeholder="解剖前状态" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-teal-700 md:text-right mb-1 md:mb-0 pr-4">
            条形码
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-teal-500"
            type="text"
            bind:value={filters.sample_barcode.value}
            placeholder="条形码" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-teal-700 md:text-right mb-1 md:mb-0 pr-4">
            盒子ID
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-teal-500"
            type="text"
            bind:value={filters.box_id.value}
            placeholder="盒子ID" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-teal-700 md:text-right mb-1 md:mb-0 pr-4">
            样本备注信息
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-teal-500"
            type="text"
            bind:value={filters.sample_notes.value}
            placeholder="样本备注信息" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-teal-700 md:text-right mb-1 md:mb-0 pr-4">
            是否分菌
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-teal-500"
            type="text"
            bind:value={filters.isolated_strain_or_not.value}
            placeholder="true | false" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-teal-700 md:text-right mb-1 md:mb-0 pr-4">
            是否已使用
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-teal-500"
            type="text"
            bind:value={filters.used_or_not.value}
            placeholder="true | false" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-teal-700 md:text-right mb-1 md:mb-0 pr-4">
            是否多只同管
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-teal-500"
            type="text"
            bind:value={filters.multi_sample_one_tube_or_not.value}
            placeholder="true | false" />
        </div>
      </div>
    </form>

  </div>
  <div class=" md:w-1/4 max-w-sm">
    <!-- <FilterSampleBackground {filters} /> -->

    <div
      class="bg-purple-100 border-t-4 border-purple-500 rounded-b
      text-purple-900 px-4 py-3 shadow-md my-2 ml-2 mr-3 text-center h-24">
      <p class="text-sm font-bold">样本背景信息</p>
      <p class="text-xs">是否喂糖水等判断，用true， false筛选</p>
    </div>

    <form class="w-full max-w-sm text-xs">

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-purple-700 md:text-right mb-1 md:mb-0 pr-4">
            蜜蜂类型
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-purple-500"
            type="text"
            bind:value={filters.bee_type.value}
            placeholder="蜜蜂类型" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-purple-700 md:text-right mb-1 md:mb-0 pr-4">
            饲养方式
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-purple-500"
            type="text"
            bind:value={filters.life_style.value}
            placeholder="饲养方式" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-purple-700 md:text-right mb-1 md:mb-0 pr-4">
            个体阶段
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-purple-500"
            type="text"
            bind:value={filters.life_stage.value}
            placeholder="个体阶段" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-purple-700 md:text-right mb-1 md:mb-0 pr-4">
            养蜂人
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-purple-500"
            type="text"
            bind:value={filters.beekeepers.value}
            placeholder="养蜂人" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-purple-700 md:text-right mb-1 md:mb-0 pr-4">
            蜂场ID
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-purple-500"
            type="text"
            bind:value={filters.filed_id.value}
            placeholder="蜂场ID" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-purple-700 md:text-right mb-1 md:mb-0 pr-4">
            蜂箱ID
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-purple-500"
            type="text"
            bind:value={filters.field_box_id.value}
            placeholder="蜂箱ID" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-purple-700 md:text-right mb-1 md:mb-0 pr-4">
            蜜蜂来源
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-purple-500"
            type="text"
            bind:value={filters.bost_origin.value}
            placeholder="蜜蜂来源" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-purple-700 md:text-right mb-1 md:mb-0 pr-4">
            蜂箱年数
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-purple-500"
            type="text"
            bind:value={filters.frame_year.value}
            placeholder="蜂箱年数" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-purple-700 md:text-right mb-1 md:mb-0 pr-4">
            取蜜频率
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-purple-500"
            type="text"
            bind:value={filters.decapping_frequency.value}
            placeholder="取蜜频率" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-purple-700 md:text-right mb-1 md:mb-0 pr-4">
            糖水频率及浓度
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-purple-500"
            type="text"
            bind:value={filters.sucroese_notes.value}
            placeholder="糖水频率及浓度" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-purple-700 md:text-right mb-1 md:mb-0 pr-4">
            生境
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-purple-500"
            type="text"
            bind:value={filters.habitat.value}
            placeholder="生境" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-purple-700 md:text-right mb-1 md:mb-0 pr-4">
            访花种类
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-purple-500"
            type="text"
            bind:value={filters.flower_species.value}
            placeholder="访花种类" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-purple-700 md:text-right mb-1 md:mb-0 pr-4">
            是否喂糖水
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-purple-500"
            type="text"
            bind:value={filters.sucrose_or_not.value}
            placeholder="true | false" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-purple-700 md:text-right mb-1 md:mb-0 pr-4">
            有无农药
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-purple-500"
            type="text"
            bind:value={filters.presticide_or_not.value}
            placeholder="true | false" />
        </div>
      </div>
    </form>

  </div>
  <div class=" md:w-1/4 max-w-sm">
    <!-- <FilterSampleEvolution {filters} /> -->

    <div
      class="bg-green-100 border-t-4 border-green-500 rounded-b text-green-900
      px-4 py-3 shadow-md my-2 ml-2 mr-3 text-center h-24">
      <p class="text-sm font-bold">样本鉴定信息</p>
      <p class="text-xs">无鉴定人的，以采集人代替</p>
    </div>

    <form class="w-full max-w-sm text-xs">

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-green-700 md:text-right mb-1 md:mb-0 pr-4">
            采集人
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-green-500"
            type="text"
            bind:value={filters.sample_collector.value}
            placeholder="采集人" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-green-700 md:text-right mb-1 md:mb-0 pr-4">
            采集时间
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-green-500"
            type="text"
            bind:value={filters.sample_collection_date.value}
            placeholder="采集时间" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-green-700 md:text-right mb-1 md:mb-0 pr-4">
            鉴定人
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-green-500"
            type="text"
            bind:value={filters.identifier_name.value}
            placeholder="鉴定人" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-green-700 md:text-right mb-1 md:mb-0 pr-4">
            鉴定人邮箱
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-green-500"
            type="text"
            bind:value={filters.identifier_email.value}
            placeholder="鉴定人邮箱" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-green-700 md:text-right mb-1 md:mb-0 pr-4">
            鉴定人单位
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-green-500"
            type="text"
            bind:value={filters.identifier_institution.value}
            placeholder="鉴定人单位" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-green-700 md:text-right mb-1 md:mb-0 pr-4">
            门
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-green-500"
            type="text"
            bind:value={filters.phylum.value}
            placeholder="门" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-green-700 md:text-right mb-1 md:mb-0 pr-4">
            纲
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-green-500"
            type="text"
            bind:value={filters.class_evolution.value}
            placeholder="纲" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-green-700 md:text-right mb-1 md:mb-0 pr-4">
            目
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-green-500"
            type="text"
            bind:value={filters.order.value}
            placeholder="目" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-green-700 md:text-right mb-1 md:mb-0 pr-4">
            科
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-green-500"
            type="text"
            bind:value={filters.family.value}
            placeholder="科" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-green-700 md:text-right mb-1 md:mb-0 pr-4">
            亚科
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-green-500"
            type="text"
            bind:value={filters.subfamily.value}
            placeholder="亚科" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-green-700 md:text-right mb-1 md:mb-0 pr-4">
            属
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-green-500"
            type="text"
            bind:value={filters.genus.value}
            placeholder="属" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-green-700 md:text-right mb-1 md:mb-0 pr-4">
            种
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-green-500"
            type="text"
            bind:value={filters.species.value}
            placeholder="种" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-green-700 md:text-right mb-1 md:mb-0 pr-4">
            亚种
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-green-500"
            type="text"
            bind:value={filters.subspecies.value}
            placeholder="亚种" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-green-700 md:text-right mb-1 md:mb-0 pr-4">
            品种
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-green-500"
            type="text"
            bind:value={filters.breed.value}
            placeholder="品种" />
        </div>
      </div>

    </form>
  </div>
  <div class=" md:w-1/4 max-w-sm">
    <!-- <FilterSampleGeo {filters} /> -->

    <div
      class="bg-indigo-100 border-t-4 border-indigo-500 rounded-b
      text-indigo-900 px-4 py-3 shadow-md my-2 ml-2 mr-3 text-center h-24 ">
      <p class="text-sm font-bold">取样地理位置</p>
      <p class="text-xs">经纬度、海拔录入信息不规范，因此使用字符串查询</p>
    </div>

    <form class="w-full max-w-sm text-xs">

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-indigo-700 md:text-right mb-1 md:mb-0 pr-4">
            大陆或大洋
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-indigo-500"
            type="text"
            bind:value={filters.continent_or_ocean.value}
            placeholder="大陆或大洋" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-indigo-700 md:text-right mb-1 md:mb-0 pr-4">
            国家
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-indigo-500"
            type="text"
            bind:value={filters.country.value}
            placeholder="国家" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-indigo-700 md:text-right mb-1 md:mb-0 pr-4">
            州或省份
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-indigo-500"
            type="text"
            bind:value={filters.state_or_province.value}
            placeholder="州或省份" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-indigo-700 md:text-right mb-1 md:mb-0 pr-4">
            城市
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-indigo-500"
            type="text"
            bind:value={filters.city.value}
            placeholder="城市" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-indigo-700 md:text-right mb-1 md:mb-0 pr-4">
            鉴定人单位
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-indigo-500"
            type="text"
            bind:value={filters.county.value}
            placeholder="鉴定人单位" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-indigo-700 md:text-right mb-1 md:mb-0 pr-4">
            详细地址
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-indigo-500"
            type="text"
            bind:value={filters.exact_site.value}
            placeholder="详细地址" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-indigo-700 md:text-right mb-1 md:mb-0 pr-4">
            纬度
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-indigo-500"
            type="text"
            bind:value={filters.latitude.value}
            placeholder="纬度" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-indigo-700 md:text-right mb-1 md:mb-0 pr-4">
            经度
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-indigo-500"
            type="text"
            bind:value={filters.longitude.value}
            placeholder="经度" />
        </div>
      </div>

      <div class="md:flex md:items-center mr-6 mb-1">
        <div class="md:w-1/3">
          <label class="block text-indigo-700 md:text-right mb-1 md:mb-0 pr-4">
            海拔
          </label>
        </div>
        <div class="md:w-2/3">
          <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded
            w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none
            focus:bg-white focus:border-indigo-500"
            type="text"
            bind:value={filters.elevation.value}
            placeholder="海拔" />
        </div>
      </div>
    </form>

  </div>
</div>

<div class="bg-yellow-100 text-center font-bold text-xl my-2">
  符合筛选条件的一共有
  <span class="text-5xl text-purple-500">{totalNum}</span>
  条记录
</div>

<form class="w-full">
  <div class="flex flex-wrap -mx-3 mb-6">
    <div class="w-full md:w-1/6 px-3 mb-6 md:mb-0">
      <label
        class="block uppercase tracking-wide text-gray-700 text-xs font-bold
        mb-2"
        for="grid-page-size">
        每页显示条数
      </label>
      <input
        class="appearance-none block w-full bg-gray-200 text-gray-700 border
        border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none
        focus:bg-white"
        id="grid-page-size"
        bind:value={pageSize} />
      <p class="text-gray-400 ml-2 text-xs italic">默认值为5，可以不设置</p>
    </div>
    <div class="w-full md:w-1/6 px-3">
      <label
        class="block uppercase tracking-wide text-gray-700 text-xs font-bold
        mb-2"
        for="grid-page-num">
        直接跳转到页面数
      </label>
      <input
        class="appearance-none block w-full bg-gray-200 text-gray-700 border
        border-gray-200 rounded py-1 px-4 mb-3 leading-tight focus:outline-none
        focus:bg-white focus:border-gray-500"
        id="grid-page-num"
        bind:value={currentPage} />
      <p class="text-gray-400 ml-2 text-xs italic">
        默认值为第一页，可以不设置
      </p>
    </div>
    <div class="w-full md:w-1/6 px-3 pt-6">
      <label class="md:w-2/3 block text-gray-500 font-bold">
        <input
          class="mr-2 leading-tight"
          type="checkbox"
          bind:checked={displayStore} />
        <span class="text-sm">显示样本保存表</span>
      </label>
    </div>

    <div class="w-full md:w-1/6 px-3 pt-6">
      <label class="md:w-2/3 block text-gray-500 font-bold">
        <input
          class="mr-2 leading-tight"
          type="checkbox"
          bind:checked={displayBackground} />
        <span class="text-sm">显示样本背景信息</span>
      </label>
    </div>

    <div class="w-full md:w-1/6 px-3 pt-6">
      <label class="md:w-2/3 block text-gray-500 font-bold">
        <input
          class="mr-2 leading-tight"
          type="checkbox"
          bind:checked={displayEvo} />
        <span class="text-sm">显示样本鉴定信息</span>
      </label>
    </div>

    <div class="w-full md:w-1/6 px-3 pt-6">
      <label class="md:w-2/3 block text-gray-500 font-bold">
        <input
          class="mr-2 leading-tight"
          type="checkbox"
          bind:checked={displayGeo} />
        <span class="text-sm">显示取样地理位置</span>
      </label>
    </div>

  </div>
</form>

<div class="text-center mb-2 align-center">
  <SPagination {totalPages} bind:currentPage />
</div>

{#if displayStore}
  <STable
    {data}
    {filters}
    {pageSize}
    {currentPage}
    class="table"
    selectedClass="table-info"
    on:totalPagesChanged={totalPagesChanged}>
    <thead slot="head" class="text-teal-500 bg-teal-100">
      <STh sortKey="sample_id" defaultSort="asc">样本ID</STh>
      <STh sortKey="head_chest_id" defaultSort="asc">头胸部ID</STh>
      <STh sortKey="head_chest_perserve_way" defaultSort="asc">头胸部保存</STh>
      <STh sortKey="abdomen_id" defaultSort="asc">腹部ID</STh>
      <STh sortKey="abdomen_preserve_way" defaultSort="asc">腹部保存</STh>
      <STh sortKey="gut_id" defaultSort="asc">肠道ID</STh>
      <STh sortKey="gut_id_preserve_way" defaultSort="asc">肠道保存</STh>
      <STh sortKey="isolated_strain_or_not" defaultSort="asc">是否分菌</STh>
      <STh sortKey="leg_id" defaultSort="asc">腿部ID</STh>
      <STh sortKey="leg_id_preserve_way" defaultSort="asc">腿部保存</STh>
      <STh sortKey="used_or_not" defaultSort="asc">是否已使用</STh>
      <STh sortKey="dissection_state" defaultSort="asc">解剖前状态</STh>
      <STh sortKey="multi_sample_one_tube_or_not" defaultSort="asc">
        是否多只同管
      </STh>
      <STh sortKey="sample_barcode" defaultSort="asc">条形码</STh>
      <STh sortKey="box_id" defaultSort="asc">盒子ID</STh>

      <STh sortKey="sample_notes" defaultSort="asc">样本备注信息</STh>

    </thead>
    <tbody slot="body" let:displayData>
      {#each displayData as row (row.sample_id)}
        <STr {row}>
          <td>{row.sample_id}</td>
          <td>{row.head_chest_id}</td>
          <td>{row.head_chest_perserve_way}</td>
          <td>{row.abdomen_id}</td>
          <td>{row.abdomen_preserve_way}</td>
          <td>{row.gut_id}</td>
          <td>{row.gut_id_preserve_way}</td>
          <td>{row.isolated_strain_or_not}</td>
          <td>{row.leg_id}</td>
          <td>{row.leg_id_preserve_way}</td>
          <td>{row.used_or_not}</td>
          <td>{row.dissection_state}</td>
          <td>{row.multi_sample_one_tube_or_not}</td>
          <td>{row.sample_barcode}</td>
          <td>{row.box_id}</td>
          <td>{row.sample_notes}</td>
        </STr>
      {/each}
    </tbody>
  </STable>
{/if}

{#if displayBackground}
  <STable
    {data}
    {filters}
    {pageSize}
    {currentPage}
    class="table"
    selectedClass="table-info"
    on:totalPagesChanged={totalPagesChanged}>
    <thead slot="head" class="text-purple-500 bg-purple-100">
      <STh sortKey="sample_id" defaultSort="asc">样本ID</STh>
      <STh sortKey="bee_type" defaultSort="asc">蜜蜂类型</STh>
      <STh sortKey="life_style" defaultSort="asc">饲养方式</STh>
      <STh sortKey="life_stage" defaultSort="asc">个体阶段</STh>
      <STh sortKey="beekeepers" defaultSort="asc">养蜂人</STh>
      <STh sortKey="filed_id" defaultSort="asc">蜂场ID</STh>
      <STh sortKey="field_box_id" defaultSort="asc">蜂箱ID</STh>
      <STh sortKey="bost_origin" defaultSort="asc">蜜蜂来源</STh>
      <STh sortKey="frame_year" defaultSort="asc">蜂箱年数</STh>
      <STh sortKey="decapping_frequency" defaultSort="asc">取蜜频率</STh>
      <STh sortKey="sucrose_or_not" defaultSort="asc">是否喂糖水</STh>
      <STh sortKey="sucroese_notes" defaultSort="asc">糖水频率及浓度</STh>
      <STh sortKey="habitat" defaultSort="asc">生境</STh>
      <STh sortKey="presticide_or_not" defaultSort="asc">有无农药</STh>
      <STh sortKey="flower_species" defaultSort="asc">访花种类</STh>

    </thead>
    <tbody slot="body" let:displayData>
      {#each displayData as row (row.sample_id)}
        <STr {row}>
          <td>{row.sample_id}</td>
          <td>{row.bee_type}</td>
          <td>{row.life_style}</td>
          <td>{row.life_stage}</td>
          <td>{row.beekeepers}</td>
          <td>{row.filed_id}</td>
          <td>{row.field_box_id}</td>
          <td>{row.bost_origin}</td>
          <td>{row.frame_year}</td>
          <td>{row.decapping_frequency}</td>
          <td>{row.sucrose_or_not}</td>
          <td>{row.sucroese_notes}</td>
          <td>{row.habitat}</td>
          <td>{row.presticide_or_not}</td>
          <td>{row.flower_species}</td>
        </STr>
      {/each}
    </tbody>
  </STable>
{/if}

{#if displayEvo}
  <STable
    {data}
    {filters}
    {pageSize}
    {currentPage}
    class="table"
    selectedClass="table-info"
    on:totalPagesChanged={totalPagesChanged}>
    <thead slot="head" class="text-green-500 bg-green-100">
      <STh sortKey="sample_id" defaultSort="asc">样本ID</STh>

      <STh sortKey="sample_collector" defaultSort="asc">采集人</STh>
      <STh sortKey="sample_collection_date" defaultSort="asc">采集时间</STh>

      <STh sortKey="identifier_name" defaultSort="asc">鉴定人</STh>
      <STh sortKey="identifier_email" defaultSort="asc">鉴定人邮箱</STh>
      <STh sortKey="identifier_institution" defaultSort="asc">鉴定人单位</STh>
      <STh sortKey="phylum" defaultSort="asc">门</STh>
      <STh sortKey="class_evolution" defaultSort="asc">纲</STh>
      <STh sortKey="order" defaultSort="asc">目</STh>
      <STh sortKey="family" defaultSort="asc">科</STh>
      <STh sortKey="subfamily" defaultSort="asc">亚科</STh>
      <STh sortKey="genus" defaultSort="asc">属</STh>
      <STh sortKey="species" defaultSort="asc">种</STh>
      <STh sortKey="subspecies" defaultSort="asc">亚种</STh>
      <STh sortKey="breed" defaultSort="asc">品种</STh>

    </thead>
    <tbody slot="body" let:displayData>
      {#each displayData as row (row.sample_id)}
        <STr {row}>
          <td>{row.sample_id}</td>
          <td>{row.sample_collector}</td>
          <td>{row.sample_collection_date}</td>
          <td>{row.identifier_name}</td>
          <td>{row.identifier_email}</td>
          <td>{row.identifier_institution}</td>
          <td>{row.phylum}</td>
          <td>{row.class_evolution}</td>
          <td>{row.order}</td>
          <td>{row.family}</td>
          <td>{row.subfamily}</td>
          <td>{row.genus}</td>
          <td>{row.species}</td>
          <td>{row.subspecies}</td>
          <td>{row.breed}</td>
        </STr>
      {/each}
    </tbody>
  </STable>
{/if}

{#if displayGeo}
  <STable
    {data}
    {filters}
    {pageSize}
    {currentPage}
    class="table"
    selectedClass="table-info"
    on:totalPagesChanged={totalPagesChanged}>
    <thead slot="head" class="text-indigo-500 bg-indigo-100">
      <STh sortKey="sample_id" defaultSort="asc">样本ID</STh>
      <STh sortKey="continent_or_ocean" defaultSort="asc">大陆或大洋</STh>
      <STh sortKey="country" defaultSort="asc">国家</STh>
      <STh sortKey="state_or_province" defaultSort="asc">州或省份</STh>
      <STh sortKey="city" defaultSort="asc">城市</STh>
      <STh sortKey="county" defaultSort="asc">县</STh>
      <STh sortKey="exact_site" defaultSort="asc">详细地址</STh>
      <STh sortKey="latitude" defaultSort="asc">纬度</STh>
      <STh sortKey="longitude" defaultSort="asc">经度</STh>
      <STh sortKey="elevation" defaultSort="asc">海拔</STh>
    </thead>
    <tbody slot="body" let:displayData>
      {#each displayData as row (row.sample_id)}
        <STr {row}>
          <td>{row.sample_id}</td>
          <td>{row.continent_or_ocean}</td>
          <td>{row.country}</td>
          <td>{row.state_or_province}</td>
          <td>{row.city}</td>
          <td>{row.county}</td>
          <td>{row.exact_site}</td>
          <td>{row.latitude}</td>
          <td>{row.longitude}</td>
          <td>{row.elevation}</td>
        </STr>
      {/each}
    </tbody>
  </STable>
{/if}

<SPagination {totalPages} bind:currentPage />

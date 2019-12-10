<script>
  export let filters;
</script>

<div
  class="bg-teal-100 border-t-4 border-teal-500 rounded-b text-teal-900 px-4
  py-3 shadow-md my-2 ml-2 mr-3 text-center">
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

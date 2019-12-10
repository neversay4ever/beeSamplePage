<script>
  export let filters;
</script>

<div
  class="bg-purple-100 border-t-4 border-purple-500 rounded-b text-purple-900
  px-4 py-3 shadow-md my-2 ml-2 mr-3 text-center">
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

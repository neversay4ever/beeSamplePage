<script>
  export let filters;
</script>

<div
  class="bg-indigo-100 border-t-4 border-indigo-500 rounded-b text-indigo-900
  px-4 py-3 shadow-md my-2 ml-2 mr-3 text-center">
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

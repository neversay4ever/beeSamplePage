<script>
  export let filters;
</script>

<div
  class="bg-green-100 border-t-4 border-green-500 rounded-b text-green-900 px-4
  py-3 shadow-md my-2 ml-2 mr-3 text-center">
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

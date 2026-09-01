export const landmarks = [
  {
    id: 'red-army-gate',
    index: '01',
    name: '红军门',
    mapLabel: '南口入口',
    eyebrow: '中国工农红军长征第一街',
    lead: '一座牌楼，开启一条保存原貌最完整、延伸最悠长的红色历史街巷。',
    story:
      '哈达铺红军长征旧址坐落在一条长 1500 多米的街道上。这里是红军在长征途中保留当年原貌最完整、最长的一条街，被誉为“中国工农红军长征第一街”。',
    facts: ['街道长 1500 多米', '红军长征第一街'],
    model: 'assets/models/red-army-gate.glb',
    position: { x: 22, y: 82 },
    labelOffset: { x: 2.5, y: -1 },
  },
  {
    id: 'tongshan-society',
    index: '02',
    name: '同善社',
    mapLabel: '同善社旧址',
    eyebrow: '红一军团二师司令部驻地',
    lead: '周恩来同志长征途中居住过、留存至今且保护较为完整的一处旧址。',
    story:
      '红一军团二师先头部队于 9 月 18 日长征到达哈达铺，司令部就设在当时称作“同善社”的院落。周恩来同志住在楼下左间，东、西厢房住着通信队和警卫战士。这处房屋是周恩来同志长征途中住过并留存下来的一处重要旧址。',
    facts: ['9 月 18 日到达哈达铺', '周恩来同志住室旧址'],
    model: 'assets/models/tongshan-society.glb',
    position: { x: 16, y: 70 },
    labelOffset: { x: 2, y: -1.5 },
  },
  {
    id: 'post-office',
    index: '03',
    name: '邮政代办所',
    mapLabel: '邮政代办所',
    eyebrow: '从报纸中发现陕北信息',
    lead: '一间小小的邮政代办所，成为长征战略转折中的重要信息窗口。',
    story:
      '长征时期的警卫员陈昌奉同志重访哈达铺时回忆，毛泽东一进哈达铺，没有直接回住所，而是先到这里翻阅国民党的报纸。他记得其中有《大公报》《民国日报》《中央日报》《西安报》。毛泽东把有用的报纸带回住室，大家轮流翻阅，并用红蓝铅笔勾画其中有价值的消息。',
    facts: ['重要信息获取地', '报纸中的陕北消息'],
    model: 'assets/models/post-office.glb',
    position: { x: 27, y: 31 },
    labelOffset: { x: 1, y: -1 },
  },
  {
    id: 'guandi-temple',
    index: '04',
    name: '关帝庙',
    mapLabel: '关帝庙',
    eyebrow: '战略决策向全军传达动员之地',
    lead: '从形成决策到统一军心，这座院落见证了“到陕北去”的重要动员。',
    story:
      '关帝庙旧建筑毁于“文革”，现大殿、左右偏殿及过厅均为 1989 年按原貌恢复重建。上午在义和昌形成决策，下午于关帝庙召开团以上干部大会，向全体官兵宣布“到陕北去”，提振军心。',
    facts: ['1989 年按原貌恢复重建', '团以上干部大会会址'],
    model: 'assets/models/guandi-temple.glb',
    position: { x: 57, y: 17 },
    labelOffset: { x: 1.5, y: -1 },
  },
  {
    id: 'zhang-courtyard',
    index: '05',
    name: '张家大院',
    mapLabel: '张家大院',
    eyebrow: '红二方面军总指挥部旧址',
    lead: '一座院落串联起贺龙、任弼时、肖克、关向应、李达等人的长征足迹。',
    story:
      '张家大院东、西、南三面房屋均为原有建筑，北房是按原貌恢复的三间二层木结构楼房。楼上是贺龙住室，楼下是任弼时、肖克、关向应住室；东厢房是李达住室；西厢房由警卫员居住。大门上悬挂着原红二方面军副总指挥肖克将军于 1995 年题写的“红二方面军总指挥部旧址”匾额。',
    facts: ['多位将领住室旧址', '肖克将军 1995 年题匾'],
    model: 'assets/models/zhang-courtyard.glb',
    position: { x: 76, y: 8 },
    labelOffset: { x: 1, y: 0 },
  },
]

export function assetUrl(relativePath) {
  return `${import.meta.env.BASE_URL}${relativePath.replace(/^\/+/, '')}`
}

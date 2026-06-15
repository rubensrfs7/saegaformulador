import { Printer } from 'lucide-react';
import { FormulationState } from '../../types';
import { MOCK_INGREDIENTS, CONSUMPTION_TARGETS } from '../../data';

interface Props {
  data: FormulationState;
}

export default function Report({ data }: Props) {
  
  const currentTarget = CONSUMPTION_TARGETS.find(t => t.category === data.category && t.subcategory === data.subcategory);
  const weight = Number(data.weight) || 0;
  
  const metaCMS = currentTarget ? weight * (currentTarget.percentPvMs / 100) : weight * 0.03;
  const metaConcentrado = currentTarget ? metaCMS * (currentTarget.concentradoPercent / 100) : metaCMS * 0.35;
  const metaVolumoso = currentTarget ? metaCMS * (currentTarget.volumosoPercent / 100) : metaCMS * 0.65;

  const animais = Number(data.quantity) || 1;
  const days = Number(data.days) || 1;

  const currentConcentrateMS = data.concentrates.reduce((sum, entry) => {
    const mn = Number(entry.mn) || 0;
    const info = MOCK_INGREDIENTS.find(i => i.id === entry.ingredientId);
    return sum + (mn && info?.msPercent ? mn * (info.msPercent / 100) : 0);
  }, 0);
  
  const currentVolumosoMS = data.volumosos.reduce((sum, entry) => {
    const mn = Number(entry.mn) || 0;
    const info = MOCK_INGREDIENTS.find(i => i.id === entry.ingredientId);
    return sum + (mn && info?.msPercent ? mn * (info.msPercent / 100) : 0);
  }, 0);

  const resolveEntries = (entries: any[], currentGroupMS: number, metaGroupMS: number) => {
    let totalMS = 0;
    const resolved = entries.map(entry => {
      const itemInfo = MOCK_INGREDIENTS.find(i => i.id === entry.ingredientId);
      if (!itemInfo) return null;
      
      const originalMS = (Number(entry.mn) || 0) * (itemInfo.msPercent / 100);
      const proportion = currentGroupMS > 0 ? originalMS / currentGroupMS : 0;
      
      const scaledMSpA = proportion * metaGroupMS;
      const scaledMNpA = itemInfo.msPercent ? scaledMSpA / (itemInfo.msPercent / 100) : 0;
      
      const msValue = scaledMSpA;
      const mnValue = scaledMNpA;
      
      totalMS += msValue;
      return { ...entry, itemInfo, msValue, mnValue };
    }).filter(Boolean);
    return { resolved, totalMS };
  }

  const conc = resolveEntries(data.concentrates, currentConcentrateMS, metaConcentrado);
  const vol = resolveEntries(data.volumosos, currentVolumosoMS, metaVolumoso);
  
  const allEntries = [...conc.resolved, ...vol.resolved];
  const globalTotalMS = conc.totalMS + vol.totalMS;
  const globalTotalMN = allEntries.reduce((s, x) => s + (x?.mnValue || 0), 0);
  const concTotalMN = conc.resolved.reduce((s, x) => s + (x?.mnValue || 0), 0);
  const volTotalMN = vol.resolved.reduce((s, x) => s + (x?.mnValue || 0), 0);

  let totalPB = 0, totalNDT = 0, totalFDN = 0, totalAmido = 0;
  let totalCalcio = 0, totalFosforo = 0;
  
  allEntries.forEach(c => {
    if(!c) return;
    totalPB += c.msValue * (c.itemInfo?.pb || 0);
    totalNDT += c.msValue * (c.itemInfo?.ndt || 0);
    totalFDN += c.msValue * (c.itemInfo?.fdn || 0);
    totalAmido += c.msValue * (c.itemInfo?.amido || 0);
    totalCalcio += c.msValue * (c.itemInfo?.calcio || 0);
    totalFosforo += c.msValue * (c.itemInfo?.fosforo || 0);
  });

  const getNutrientColor = (nutrient: string, value: number) => {
    if (!currentTarget) return 'text-gray-800';
    if (nutrient === 'PB' && currentTarget.pbTmr) {
      return value >= currentTarget.pbTmr ? 'text-green-600' : 'text-red-500';
    }
    if (nutrient === 'NDT' && currentTarget.ndtTmr) {
      return value >= currentTarget.ndtTmr ? 'text-green-600' : 'text-red-500';
    }
    if (nutrient === 'FDN' && currentTarget.fdnTmr) {
      return value <= currentTarget.fdnTmr ? 'text-green-600' : 'text-red-500'; 
    }
    if (nutrient === 'AMIDO' && currentTarget.amidoPercent) {
      return value <= (currentTarget.amidoPercent * 10) ? 'text-green-600' : 'text-red-500'; 
    }
    return 'text-gray-800';
  };

  const nutrientCards = [
    { label: 'PB', value: globalTotalMS > 0 ? totalPB / globalTotalMS : 0 },
    { label: 'NDT', value: globalTotalMS > 0 ? totalNDT / globalTotalMS : 0 },
    { label: 'FDN', value: globalTotalMS > 0 ? totalFDN / globalTotalMS : 0 },
    { label: 'AMIDO', value: globalTotalMS > 0 ? totalAmido / globalTotalMS : 0 },
    { label: 'CÁLCIO', value: globalTotalMS > 0 ? totalCalcio / globalTotalMS : 0 },
    { label: 'FÓSFORO', value: globalTotalMS > 0 ? totalFosforo / globalTotalMS : 0 },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm font-bold text-gray-400 tracking-widest uppercase">Visualizar</h2>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          <Printer size={18} /> Imprimir
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 print:shadow-none print:border-none">
        
        {/* Header */}
        <div className="flex justify-between items-end border-b-4 border-blue-600 pb-4 mb-8">
          <img src="https://preview.saega.com.br/version_2_final/assets/logotipo-so-CgB1U75J.png" alt="Saega" className="h-10" referrerPolicy="no-referrer" />
          <div className="text-sm font-bold text-gray-400">DATA: {new Date().toLocaleDateString('pt-BR')}</div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-2">Relatório Nutricional</h1>
          <h2 className="text-2xl font-black text-blue-700 uppercase">{data.name || 'Fórmula Sem Nome'}</h2>
        </div>

        <section className="mb-10">
          <h3 className="text-xs font-bold text-blue-700 tracking-wider mb-4">1. PERFIL DO ANIMAL</h3>
          <div className="bg-gray-50 rounded-xl p-5 flex flex-wrap gap-8">
            <div>
              <div className="text-[10px] font-bold text-gray-400 mb-1">CATEGORIA</div>
              <div className="text-sm font-bold text-gray-800">{data.category || '-'}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 mb-1">SUBCATEGORIA</div>
              <div className="text-sm font-bold text-gray-800">{data.subcategory || '-'}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 mb-1">PESO</div>
              <div className="text-sm font-bold text-gray-800">{data.weight || '-'} kg</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 mb-1">QUANT. ANIMAIS</div>
              <div className="text-sm font-bold text-gray-800">{data.quantity || '1'}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 mb-1">PERÍODO (DIAS)</div>
              <div className="text-sm font-bold text-gray-800">{data.days || '1'} dias</div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h3 className="text-xs font-bold text-blue-700 tracking-wider mb-4">2. METAS DE CONSUMO</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-5">
              <div className="text-[10px] font-bold text-gray-400 mb-3">META DE CMS</div>
              <div className="text-xl font-black text-gray-800">{metaCMS.toFixed(2).replace(/\.00$/, '')} kg/dia</div>
            </div>
            <div className="bg-[#fffcf8] border border-orange-100 rounded-xl p-5">
              <div className="text-[10px] font-bold text-orange-600 mb-3">META DE CONCENTRADO</div>
              <div className="text-xl font-black text-gray-800 mb-1">{metaConcentrado.toFixed(2).replace(/\.00$/, '')} kg MS</div>
              <div className="text-xs font-bold text-orange-500">{currentTarget?.concentradoPercent || 35}%</div>
            </div>
            <div className="bg-[#f0fdf4] border border-green-100 rounded-xl p-5">
              <div className="text-[10px] font-bold text-green-700 mb-3">META DE VOLUMOSO</div>
              <div className="text-xl font-black text-gray-800 mb-1">{metaVolumoso.toFixed(2).replace(/\.00$/, '')} kg MS</div>
              <div className="text-xs font-bold text-green-600">{currentTarget?.volumosoPercent || 65}%</div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h3 className="text-xs font-bold text-blue-700 tracking-wider mb-4">3. FÓRMULA DO CONCENTRADO</h3>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left font-bold text-gray-400 text-[10px] uppercase p-4">Insumo</th>
                  <th className="text-right font-bold text-gray-400 text-[10px] uppercase p-4">Quantidade</th>
                  <th className="text-right font-bold text-gray-400 text-[10px] uppercase p-4">% Mistura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {conc.resolved.map((item, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="p-4 text-gray-700 font-medium">{item?.itemInfo?.name}</td>
                    <td className="p-4 text-right font-bold">{item?.mnValue.toFixed(2)} kg</td>
                    <td className="p-4 text-right text-gray-500">
                      {concTotalMN > 0 ? ((item!.mnValue / concTotalMN) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#fff8eb] border-t border-orange-100">
                <tr>
                  <td colSpan={3} className="p-4">
                    <div className="flex justify-between items-center text-orange-700">
                      <div className="font-bold text-xs">TOTAL CONCENTRADO</div>
                      <div className="flex gap-12 font-black">
                        <div>{concTotalMN.toFixed(2)} kg MN</div>
                        <div>100%</div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <section className="mb-10">
          <h3 className="text-xs font-bold text-blue-700 tracking-wider mb-4">4. VOLUMOSO</h3>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left font-bold text-gray-400 text-[10px] uppercase p-4">Insumo</th>
                  <th className="text-right font-bold text-gray-400 text-[10px] uppercase p-4">Quantidade</th>
                  <th className="text-right font-bold text-gray-400 text-[10px] uppercase p-4">% Mistura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vol.resolved.map((item, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="p-4 text-gray-700 font-medium">{item?.itemInfo?.name}</td>
                    <td className="p-4 text-right font-bold">{item?.mnValue.toFixed(2)} kg</td>
                    <td className="p-4 text-right text-gray-500">
                      {volTotalMN > 0 ? ((item!.mnValue / volTotalMN) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#f0fdf4] border-t border-green-100">
                <tr>
                  <td colSpan={3} className="p-4">
                    <div className="flex justify-between items-center text-green-700">
                      <div className="font-bold text-xs uppercase">Total Volumoso</div>
                      <div className="flex gap-12 font-black text-right pr-4">
                        <div>{volTotalMN.toFixed(2)} kg MN</div>
                        <div>100%</div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <section className="mb-12">
          <h3 className="text-xs font-bold text-blue-700 tracking-wider mb-4">5. DIETA TOTAL</h3>
          
          <div className="mb-6 border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {allEntries.map((item, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="py-4 px-6 w-40 hidden sm:table-cell">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        item?.itemInfo?.type === 'Concentrado' ? 'bg-orange-50 text-orange-600 border-orange-200' : 
                        item?.itemInfo?.type === 'Mineral' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                        item?.itemInfo?.type === 'Volumoso' ? 'bg-green-50 text-green-600 border-green-200' :
                        'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        {item?.itemInfo?.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-left text-gray-700 font-bold">{item?.itemInfo?.name}</td>
                    <td className="py-4 px-4 text-right font-medium">{item?.mnValue.toFixed(2)}</td>
                    <td className="py-4 px-4 text-right font-medium">{item?.msValue.toFixed(2)}</td>
                    <td className="py-4 px-6 text-right text-gray-500 font-semibold">
                      {globalTotalMS > 0 ? ((item!.msValue / globalTotalMS) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            {/* Nutritional Cards */}
            <div className="p-6 bg-white border-b border-gray-100">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {nutrientCards.map((card, i) => (
                  <div key={i} className="border border-gray-100 bg-gray-50 rounded-xl p-4 flex flex-col justify-center">
                    <div className="text-[10px] font-bold text-gray-500 mb-1">{card.label}</div>
                    <div className={`text-xl font-bold flex items-baseline gap-1 ${getNutrientColor(card.label, card.value)}`}>
                      {card.value.toFixed(2)}
                      <span className="text-[10px] font-medium text-gray-400">g/kg</span>
                    </div>
                    <div className={`text-[10px] font-bold mt-1 ${getNutrientColor(card.label, card.value)}`}>
                      {(card.value / 10).toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#f4f7fb] p-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex flex-col md:flex-row gap-4 sm:gap-8 items-start md:items-center w-full">
                <div>
                  <div className="text-[10px] font-bold text-blue-800 mb-1 tracking-wider uppercase">Total MN da Dieta (1 Animal)</div>
                  <div className="text-3xl font-black text-blue-900">{globalTotalMN.toFixed(2)} <span className="text-sm font-semibold">Kg</span></div>
                </div>
                
                <div className="hidden md:block h-10 w-px bg-blue-200"></div>

                <div className="flex gap-6">
                   <div>
                      <div className="text-[10px] font-bold text-orange-600 tracking-wider uppercase mb-1">Concentrado ({currentTarget?.concentradoPercent || 35}%)</div>
                      <div className="text-xl font-black text-orange-600">
                        {concTotalMN.toFixed(2)} <span className="text-xs font-bold">Kg MN</span>
                      </div>
                   </div>
                   <div>
                      <div className="text-[10px] font-bold text-green-700 tracking-wider uppercase mb-1">Volumoso ({currentTarget?.volumosoPercent || 65}%)</div>
                      <div className="text-xl font-black text-green-700">
                        {volTotalMN.toFixed(2)} <span className="text-xs font-bold">Kg MN</span>
                      </div>
                   </div>
                </div>
              </div>
              
              <div className="text-left md:text-right shrink-0 w-full md:w-auto border-t border-blue-200 pt-4 md:border-t-0 md:pt-0">
                <div className="text-[10px] font-bold text-blue-600 mb-1 uppercase tracking-wider">Total MS da Dieta (1 Animal)</div>
                <div className="text-2xl font-bold text-blue-800">{globalTotalMS.toFixed(2)} <span className="text-sm font-medium">Kg</span></div>
              </div>
            </div>
          </div>
        </section>

        {animais > 1 && (
          <section className="mb-12 print:break-before-page">
            <h3 className="text-xs font-bold text-blue-700 tracking-wider mb-4">6. MISTURA DIÁRIA DO LOTE ({animais} ANIMAIS)</h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="py-4 px-6 text-left font-bold text-gray-400 text-[10px] uppercase">Insumo</th>
                    <th className="py-4 px-6 text-right font-bold text-gray-400 text-[10px] uppercase">MN (kg) Lote</th>
                    <th className="py-4 px-6 text-right font-bold text-gray-400 text-[10px] uppercase">MS (kg) Lote</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allEntries.map((item, idx) => (
                    <tr key={idx} className="bg-white">
                      <td className="py-4 px-6 font-bold text-gray-700 flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          item?.itemInfo?.type === 'Concentrado' ? 'bg-orange-50 text-orange-600 border-orange-200' : 
                          item?.itemInfo?.type === 'Mineral' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                          'bg-green-50 text-green-600 border-green-200'
                        }`}>
                          {item?.itemInfo?.type === 'Concentrado' ? 'C' : item?.itemInfo?.type === 'Mineral' ? 'M' : 'V'}
                        </span>
                        {item?.itemInfo?.name}
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-blue-600">{(item!.mnValue * animais).toFixed(2)} kg</td>
                      <td className="py-4 px-6 text-right text-gray-500 font-medium">{(item!.msValue * animais).toFixed(2)} kg</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#f4f7fb] border-t border-blue-100">
                  <tr>
                    <td className="py-4 px-6 font-bold text-blue-900 uppercase text-xs">Total Batida Diária</td>
                    <td className="py-4 px-6 text-right font-black text-blue-700 text-xl">{(globalTotalMN * animais).toFixed(2)} <span className="text-xs">kg MN</span></td>
                    <td className="py-4 px-6 text-right font-black text-gray-600 text-xl">{(globalTotalMS * animais).toFixed(2)} <span className="text-xs">kg MS</span></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        )}

        {days > 1 && (
          <section className="mb-12 print:break-before-page">
            <h3 className="text-xs font-bold text-blue-700 tracking-wider mb-4">7. MISTURA TOTAL DO PERÍODO ({days} DIAS)</h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="py-4 px-6 text-left font-bold text-gray-400 text-[10px] uppercase">Insumo</th>
                    <th className="py-4 px-6 text-right font-bold text-gray-400 text-[10px] uppercase">MN (kg) Total</th>
                    <th className="py-4 px-6 text-right font-bold text-gray-400 text-[10px] uppercase">MS (kg) Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allEntries.map((item, idx) => (
                    <tr key={idx} className="bg-white">
                      <td className="py-4 px-6 font-bold text-gray-700 flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          item?.itemInfo?.type === 'Concentrado' ? 'bg-orange-50 text-orange-600 border-orange-200' : 
                          item?.itemInfo?.type === 'Mineral' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                          'bg-green-50 text-green-600 border-green-200'
                        }`}>
                          {item?.itemInfo?.type === 'Concentrado' ? 'C' : item?.itemInfo?.type === 'Mineral' ? 'M' : 'V'}
                        </span>
                        {item?.itemInfo?.name}
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-blue-700">{(item!.mnValue * animais * days).toFixed(2)} kg</td>
                      <td className="py-4 px-6 text-right text-gray-500 font-medium">{(item!.msValue * animais * days).toFixed(2)} kg</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#f0f9ff] border-t border-blue-200">
                  <tr>
                    <td className="py-4 px-6 font-bold text-blue-900 uppercase text-xs">Total Consumo Período</td>
                    <td className="py-4 px-6 text-right font-black text-blue-800 text-2xl">{(globalTotalMN * animais * days).toFixed(2)} <span className="text-sm">kg MN</span></td>
                    <td className="py-4 px-6 text-right font-black text-gray-700 text-2xl">{(globalTotalMS * animais * days).toFixed(2)} <span className="text-sm">kg MS</span></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        )}

        <div className="border-t border-gray-100 pt-8 flex justify-between items-end">
          <div>
            <div className="text-[10px] font-bold text-gray-400 mb-1 tracking-widest uppercase">Responsável Técnico</div>
            <div className="text-sm font-bold text-gray-800">Neide Almeida</div>
            <div className="text-xs font-bold text-gray-400 mt-1">CRMV n° 000000</div>
          </div>
          <div className="text-[10px] font-bold text-gray-300 tracking-widest uppercase">
            GERADO VIA SAEGA
          </div>
        </div>

      </div>
    </div>
  );
}

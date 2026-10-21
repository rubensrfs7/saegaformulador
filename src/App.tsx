/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Header from './components/Header';
import Stepper from './components/Stepper';
import NavigationButtons from './components/NavigationButtons';
import AnimalProfile from './components/steps/AnimalProfile';
import CurrentFeed from './components/steps/CurrentFeed';
import CurrentDietSummary from './components/steps/CurrentDietSummary';
import AdjustedFeed from './components/steps/AdjustedFeed';
import AdjustedDietSummary from './components/steps/AdjustedDietSummary';
import Report from './components/steps/Report';
import DatabaseView from './components/database/DatabaseView';
import { Step, FormulationState } from './types';
import { CONSUMPTION_TARGETS } from './data';

export default function App() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [activeView, setActiveView] = useState<'formulator' | 'database'>('formulator');

  // Estado inicial limpo (zerado) para o usuário montar do zero a partir do Perfil do Animal
  const [data, setData] = useState<FormulationState>({
    name: '',
    category: '',
    subcategory: '',
    weight: '',
    quantity: '',
    days: '',
    hasCurrentDiet: true,
    currentVolumosoMode: 'total',
    currentConcentradoKg: '',
    currentVolumosoKg: '',
    currentConcentradoPercent: '',
    currentVolumosoPercent: '',
    currentConcentrates: [],
    currentVolumosos: [],
    adjustedVolumosoMode: 'total',
    adjustedConcentrates: [],
    adjustedVolumosos: [],
    reportSourceStep: 5
  });

  const updateData = (fields: Partial<FormulationState>) => {
    setData(prev => ({ ...prev, ...fields }));
  };

  const handleStepClick = (step: Step) => {
    setActiveView('formulator');
    setCurrentStep(step);
  };

  const handleSelectTargetFromDB = (target: (typeof CONSUMPTION_TARGETS)[0]) => {
    updateData({
      category: target.category,
      subcategory: target.subcategory,
      weight: target.pvReferencia
    });
    setActiveView('formulator');
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans antialiased flex flex-col">
      <Header
        activeView={activeView}
        onSelectView={view => setActiveView(view)}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeView === 'database' ? (
          <DatabaseView
            onBackToFormulator={() => setActiveView('formulator')}
            onSelectTargetForFormulation={handleSelectTargetFromDB}
          />
        ) : (
          <>
            <Stepper
              currentStep={currentStep}
              onStepClick={handleStepClick}
            />

            {currentStep === 1 && (
              <>
                <AnimalProfile
                  data={data}
                  updateData={updateData}
                  onOpenDatabase={() => setActiveView('database')}
                />
                <NavigationButtons
                  nextLabel="Avançar para Dieta Atual"
                  onNext={() => setCurrentStep(2)}
                />
              </>
            )}

            {currentStep === 2 && (
              <>
                <CurrentFeed
                  data={data}
                  updateData={updateData}
                  onSkipToAdjusted={() => setCurrentStep(4)}
                />
                <NavigationButtons
                  prevLabel="Voltar ao Perfil"
                  onPrev={() => setCurrentStep(1)}
                  nextLabel="Avançar para Diagnóstico da Dieta Atual"
                  onNext={() => setCurrentStep(3)}
                  onSkipToReport={() => {
                    updateData({ reportSourceStep: 3 });
                    setCurrentStep(6);
                  }}
                  skipReportLabel="Relatório da Dieta Atual"
                />
              </>
            )}

            {currentStep === 3 && (
              <>
                <CurrentDietSummary
                  data={data}
                  onJumpToReport={() => {
                    updateData({ reportSourceStep: 3 });
                    setCurrentStep(6);
                  }}
                  onProceedToAdjusted={() => setCurrentStep(4)}
                />
                <NavigationButtons
                  prevLabel="Voltar para Insumos Atuais"
                  onPrev={() => setCurrentStep(2)}
                  nextLabel="Avançar para Formulação Ajustada"
                  onNext={() => setCurrentStep(4)}
                  onSkipToReport={() => {
                    updateData({ reportSourceStep: 3 });
                    setCurrentStep(6);
                  }}
                  skipReportLabel="Gerar Relatório Atual"
                />
              </>
            )}

            {currentStep === 4 && (
              <>
                <AdjustedFeed
                  data={data}
                  updateData={updateData}
                />
                <NavigationButtons
                  prevLabel="Voltar"
                  onPrev={() => setCurrentStep(data.hasCurrentDiet ? 3 : 2)}
                  nextLabel="Avançar para Resumo da Dieta Ajustada"
                  onNext={() => setCurrentStep(5)}
                />
              </>
            )}

            {currentStep === 5 && (
              <>
                <AdjustedDietSummary
                  data={data}
                  onGoToReport={() => {
                    updateData({ reportSourceStep: 5 });
                    setCurrentStep(6);
                  }}
                />
                <NavigationButtons
                  prevLabel="Voltar aos Insumos Ajustados"
                  onPrev={() => setCurrentStep(4)}
                  nextLabel="Gerar Relatório Executivo"
                  onNext={() => {
                    updateData({ reportSourceStep: 5 });
                    setCurrentStep(6);
                  }}
                />
              </>
            )}

            {currentStep === 6 && (
              <Report
                data={data}
                onNavigateToAdjusted={() => setCurrentStep(4)}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

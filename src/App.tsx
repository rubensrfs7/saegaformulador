import { useState } from 'react';
import Header from './components/Header';
import Stepper from './components/Stepper';
import AnimalProfile from './components/steps/AnimalProfile';
import CurrentFeed from './components/steps/CurrentFeed';
import CurrentDietSummary from './components/steps/CurrentDietSummary';
import AdjustedFeed from './components/steps/AdjustedFeed';
import AdjustedDietSummary from './components/steps/AdjustedDietSummary';
import Report from './components/steps/Report';
import DatabaseView from './components/database/DatabaseView';
import NavigationButtons from './components/NavigationButtons';
import { FormulationState, Step, ConsumptionTarget } from './types';

const INITIAL_STATE: FormulationState = {
  name: '',
  category: '',
  subcategory: '',
  weight: '',
  quantity: 1,
  days: 1,
  hasCurrentDiet: true,
  currentConcentrates: [],
  currentVolumosos: [],
  adjustedConcentrates: [],
  adjustedVolumosos: [],
  reportSourceStep: undefined
};

export default function App() {
  const [currentView, setCurrentView] = useState<'formulator' | 'database'>('formulator');
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formulationData, setFormulationData] = useState<FormulationState>(INITIAL_STATE);

  const updateData = (data: Partial<FormulationState>) => {
    setFormulationData(prev => ({ ...prev, ...data }));
  };

  const handleSelectTargetFromDatabase = (target: ConsumptionTarget) => {
    updateData({
      category: target.category,
      subcategory: target.subcategory,
      weight: target.pvReferencia
    });
    setCurrentStep(1);
    setCurrentView('formulator');
  };

  // Step 2 specific: "Não tenho dieta atual" -> skips directly to Step 4
  const handleSkipCurrentDiet = () => {
    updateData({ hasCurrentDiet: false });
    setCurrentStep(4);
  };

  // Step 3 specific: Jump directly to Step 6 Report
  const handleJumpToReportFromStep3 = () => {
    updateData({ reportSourceStep: 3 });
    setCurrentStep(6);
  };

  // Step 5 specific: Go to Step 6 Report
  const handleGoToReportFromStep5 = () => {
    updateData({ reportSourceStep: 5 });
    setCurrentStep(6);
  };

  const handleStepClick = (step: Step) => {
    setCurrentStep(step);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800 pb-12">
      <Header 
        activeView={currentView}
        onSelectView={setCurrentView}
      />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-8">
        {currentView === 'database' ? (
          <DatabaseView
            onBackToFormulator={() => setCurrentView('formulator')}
            onSelectTargetForFormulation={handleSelectTargetFromDatabase}
          />
        ) : (
          <>
            <Stepper currentStep={currentStep} onStepClick={handleStepClick} />
            
            <div className="mt-8">
              {/* FASE 1: PERFIL DO ANIMAL */}
              {currentStep === 1 && (
                <>
                  <AnimalProfile 
                    data={formulationData} 
                    updateData={updateData} 
                    onOpenDatabase={() => setCurrentView('database')}
                  />
                  <NavigationButtons 
                    onNext={() => setCurrentStep(2)} 
                    nextLabel="Avançar para Dieta Atual"
                  />
                </>
              )}

          {/* FASE 2: CONCENTRADO E VOLUMOSO ATUAL */}
          {currentStep === 2 && (
            <>
              <CurrentFeed 
                data={formulationData} 
                updateData={updateData} 
                onSkipToAdjusted={handleSkipCurrentDiet}
              />
              <NavigationButtons 
                onPrev={() => setCurrentStep(1)} 
                onNext={() => setCurrentStep(3)} 
                nextLabel="Avançar para Resumo da Dieta Atual"
              />
            </>
          )}

          {/* FASE 3: DIETA ATUAL CONSOLIDADA */}
          {currentStep === 3 && (
            <>
              <CurrentDietSummary 
                data={formulationData} 
                onJumpToReport={handleJumpToReportFromStep3}
                onProceedToAdjusted={() => setCurrentStep(4)}
              />
              <NavigationButtons 
                onPrev={() => setCurrentStep(2)} 
                onNext={() => setCurrentStep(4)} 
                nextLabel="Avançar para Concentrado e Volumoso Ajustado"
                onSkipToReport={handleJumpToReportFromStep3}
                skipReportLabel="Pular para o Relatório (Pág. 6)"
              />
            </>
          )}

          {/* FASE 4: CONCENTRADO E VOLUMOSO AJUSTADO */}
          {currentStep === 4 && (
            <>
              <AdjustedFeed 
                data={formulationData} 
                updateData={updateData} 
              />
              <NavigationButtons 
                onPrev={() => setCurrentStep(formulationData.hasCurrentDiet ? 3 : 2)} 
                onNext={() => setCurrentStep(5)} 
                nextLabel="Avançar para Dieta Ajustada"
              />
            </>
          )}

          {/* FASE 5: DIETA AJUSTADA CONSOLIDADA */}
          {currentStep === 5 && (
            <>
              <AdjustedDietSummary 
                data={formulationData} 
                onGoToReport={handleGoToReportFromStep5}
              />
              <NavigationButtons 
                onPrev={() => setCurrentStep(4)} 
                onNext={handleGoToReportFromStep5} 
                nextLabel="Avançar para Relatório Final"
              />
            </>
          )}

          {/* FASE 6: RELATÓRIO */}
          {currentStep === 6 && (
            <>
              <Report 
                data={formulationData} 
                onNavigateToAdjusted={() => setCurrentStep(4)}
              />
              <NavigationButtons 
                onPrev={() => setCurrentStep(formulationData.reportSourceStep === 3 ? 3 : 5)} 
                prevLabel={formulationData.reportSourceStep === 3 ? 'Voltar para Dieta Atual' : 'Voltar para Dieta Ajustada'}
                isLast
              />
            </>
          )}
        </div>
          </>
        )}
      </main>
    </div>
  );
}

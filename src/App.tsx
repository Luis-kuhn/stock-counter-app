import { useState, useEffect } from "react";
import { ProductInput } from "./components/ProductInput";
import { ConfigurationMenu } from "./components/ConfigurationMenu";
import {
  loadTabsFromStorage,
  saveTabsToStorage,
} from "./utils/storage";
import type { Tab } from "./utils/storage";
// If you need to use ProductItem as a type in the future, import it like this:
// import type { ProductItem } from "./utils/storage";

function App() {
  const [tabs, setTabs] = useState<Tab[]>(loadTabsFromStorage());
  const [currentTabId, setCurrentTabId] = useState<string | null>(null);
  const [currentWellName, setCurrentWellName] = useState<string>("");

  const [showConfig, setShowConfig] = useState(false);

  // Inicializar tabs e wells padrão
  useEffect(() => {
    if (tabs.length === 0) {
      const defaultTab: Tab = {
        id: crypto.randomUUID(),
        name: "Main Bar",
        wells: [{ name: "Well 1", products: [] }],
      };
      setTabs([defaultTab]);
      setCurrentTabId(defaultTab.id);
      setCurrentWellName("Well 1");
    } else if (!currentTabId) {
      setCurrentTabId(tabs[0].id);
      setCurrentWellName(tabs[0].wells[0]?.name || "");
    } else {
      // Se tab atual não tiver wells, definir o primeiro well se existir
      const currentTab = tabs.find((t) => t.id === currentTabId);
      if (currentTab && !currentTab.wells.find((w) => w.name === currentWellName)) {
        setCurrentWellName(currentTab.wells[0]?.name || "");
      }
    }
  }, [tabs, currentTabId, currentWellName]);

  useEffect(() => {
    saveTabsToStorage(tabs);
  }, [tabs]);

  const [masterItems, setMasterItems] = useState<string[]>([]);

  useEffect(() => {
    fetch("/data/items.json")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.items)) {
          setMasterItems(data.items);
        } else {
          console.error("Formato inválido em items.json");
        }
      })
      .catch((err) => console.error("Erro carregando items.json:", err));
  }, []);

  const currentTab = tabs.find((t) => t.id === currentTabId);
  const currentWell =
    currentTab?.wells.find((w) => w.name === currentWellName) || null;

  const addProduct = (name: string, quantity: number) => {
    if (!currentTab || !currentWellName) return;

    const newTabs = tabs.map((tab) => {
      if (tab.id !== currentTabId) return tab;

      const wells = tab.wells.map((well) => {
        if (well.name !== currentWellName) return well;

        const normName = name.replace(/\s+/g, "").toLowerCase();
        const existing = well.products.find(
          (p) => p.name.replace(/\s+/g, "").toLowerCase() === normName
        );

        if (existing) {
          existing.quantity += quantity;
          if (existing.quantity <= 0) {
            return {
              ...well,
              products: well.products.filter((p) => p !== existing),
            };
          }
          return { ...well, products: [...well.products] };
        }

        if (quantity > 0) {
          return { ...well, products: [...well.products, { name, quantity }] };
        }
        return well;
      });

      return { ...tab, wells };
    });

    setTabs(newTabs);
  };

  const removeProduct = (productIndex: number) => {
    if (!currentTab || !currentWell) return;

    const newTabs = tabs.map((tab) => {
      if (tab.id !== currentTabId) return tab;

      const wells = tab.wells.map((well) => {
        if (well.name !== currentWellName) return well;

        const products = [...well.products];
        products.splice(productIndex, 1);
        return { ...well, products };
      });

      return { ...tab, wells };
    });

    setTabs(newTabs);
  };

  const clearCurrentWell = () => {
    if (!currentTab || !currentWell) return;

    const newTabs = tabs.map((tab) => {
      if (tab.id !== currentTabId) return tab;

      const wells = tab.wells.map((well) => {
        if (well.name !== currentWellName) return well;

        return { ...well, products: [] };
      });

      return { ...tab, wells };
    });

    setTabs(newTabs);
  };

  return (
    <main className="p-4 max-w-md mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">🍸 BarStock_____</h1>
        <button
          onClick={() => setShowConfig(true)}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Configuration
        </button>
      </header>

      {/* Abas de Bars */}
      <nav className="flex gap-2 overflow-auto mb-4 border-b border-gray-300 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`whitespace-nowrap px-3 py-1 rounded ${tab.id === currentTabId
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
              }`}
            onClick={() => {
              setCurrentTabId(tab.id);
              // Ajusta well para primeiro well ao mudar aba
              setCurrentWellName(tabs.find((t) => t.id === tab.id)?.wells[0]?.name || "");
            }}
          >
            {tab.name}
          </button>
        ))}
      </nav>

      {/* Wells da aba selecionada */}
      <nav className="flex gap-2 overflow-auto mb-4 border-b border-gray-300 pb-2">
        {currentTab?.wells.map((well) => (
          <button
            key={well.name}
            className={`whitespace-nowrap px-3 py-1 rounded ${well.name === currentWellName
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-700"
              }`}
            onClick={() => setCurrentWellName(well.name)}
          >
            {well.name}
          </button>
        ))}
      </nav>

      {/* Lista detalhada da well selecionada */}
      <div className="mb-4">
        {currentWell?.products.length === 0 ? (
          <p className="text-gray-500 italic">No items in the selected well.</p>
        ) : (
          <ul className="divide-y divide-gray-300 max-h-64 overflow-auto">
            {currentWell &&
              currentWell.products.map((p, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center py-2"
                >
                  <label className="flex items-center gap-2 cursor-pointer w-full">
                    <input
                      type="checkbox"
                      className="w-5 h-5"
                      onChange={() => removeProduct(i)}
                    />
                    <span>
                      {p.quantity} × {p.name}
                    </span>
                  </label>
                </li>
              ))}
          </ul>
        )}
      </div>

      {/* Input */}
      <ProductInput
        onAdd={addProduct}
        autocompleteItems={Array.from(
          new Set([
            ...masterItems,
            ...(currentTab?.wells.flatMap((w) => w.products.map((p) => p.name)) || [])
          ])
        )}
      />

      {/* Botões */}
      <div className="flex gap-2">
        <button
          onClick={clearCurrentWell}
          className="flex-grow bg-red-600 text-white py-2 rounded hover:bg-red-700"
        >
          Clear Current Well List
        </button>
      </div>

      {/* Menu de Configurações */}
      {showConfig && (
        <ConfigurationMenu
          tabs={tabs}
          currentTabId={currentTabId}
          setTabs={setTabs}
          setCurrentTabId={setCurrentTabId}
          currentWellName={currentWellName}
          setCurrentWellName={setCurrentWellName}
          onClose={() => setShowConfig(false)}
        />
      )}
    </main>
  );
}

export default App;

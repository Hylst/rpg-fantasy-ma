import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { 
  Package, 
  Sword, 
  Shield, 
  Shirt, 
  Crown, 
  Gem, 
  Trash2, 
  Eye,
  Plus,
  Minus
} from 'lucide-react';
import { useGame } from '../../contexts/GameContext';

const InventoryManager = ({ character }) => {
  const { manageInventory, loading } = useGame();
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory');

  if (!character) {
    return (
      <Card className="w-full bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Inventaire</CardTitle>
          <CardDescription className="text-gray-400">Aucun personnage sélectionné</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { inventory = [], equipped_items = {} } = character;

  const getItemIcon = (itemType) => {
    switch (itemType) {
      case 'weapon': return <Sword className="w-4 h-4" />;
      case 'armor': return <Shield className="w-4 h-4" />;
      case 'clothing': return <Shirt className="w-4 h-4" />;
      case 'accessory': return <Crown className="w-4 h-4" />;
      case 'consumable': return <Gem className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getItemRarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary': return 'bg-yellow-600';
      case 'epic': return 'bg-purple-600';
      case 'rare': return 'bg-blue-600';
      case 'uncommon': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const handleEquipItem = async (item) => {
    try {
      await manageInventory('equip', { item_id: item.id });
    } catch (error) {
      console.error('Erreur lors de l\'équipement:', error);
    }
  };

  const handleUnequipItem = async (slot) => {
    try {
      await manageInventory('unequip', { slot });
    } catch (error) {
      console.error('Erreur lors du déséquipement:', error);
    }
  };

  const handleDropItem = async (item) => {
    try {
      await manageInventory('drop', { item_id: item.id });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleUseItem = async (item) => {
    try {
      await manageInventory('use', { item_id: item.id });
    } catch (error) {
      console.error('Erreur lors de l\'utilisation:', error);
    }
  };

  const ItemCard = ({ item, isEquipped = false, slot = null }) => (
    <Card className="bg-gray-700 border-gray-600 hover:bg-gray-650 transition-colors">
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getItemIcon(item.type)}
            <div>
              <h4 className="text-white font-medium">{item.name}</h4>
              <Badge 
                variant="secondary" 
                className={`text-xs ${getItemRarityColor(item.rarity)} text-white`}
              >
                {item.rarity || 'commun'}
              </Badge>
            </div>
          </div>
          
          <div className="flex space-x-1">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedItem(item)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700 text-white">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    {getItemIcon(item.type)}
                    <span>{item.name}</span>
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                    {item.description || 'Aucune description disponible'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  {item.stats && (
                    <div>
                      <h4 className="font-medium text-green-400">Statistiques:</h4>
                      <ul className="text-sm text-gray-300">
                        {Object.entries(item.stats).map(([stat, value]) => (
                          <li key={stat}>
                            {stat}: +{value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {item.effects && (
                    <div>
                      <h4 className="font-medium text-blue-400">Effets:</h4>
                      <ul className="text-sm text-gray-300">
                        {item.effects.map((effect, index) => (
                          <li key={index}>{effect}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex space-x-2 pt-4">
                    {!isEquipped && item.type !== 'consumable' && (
                      <Button 
                        onClick={() => handleEquipItem(item)}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Équiper
                      </Button>
                    )}
                    {isEquipped && (
                      <Button 
                        onClick={() => handleUnequipItem(slot)}
                        disabled={loading}
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        Déséquiper
                      </Button>
                    )}
                    {item.type === 'consumable' && (
                      <Button 
                        onClick={() => handleUseItem(item)}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Utiliser
                      </Button>
                    )}
                    <Button 
                      onClick={() => handleDropItem(item)}
                      disabled={loading}
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {item.quantity && item.quantity > 1 && (
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              Quantité: {item.quantity}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const equipmentSlots = [
    { key: 'weapon', label: 'Arme', icon: <Sword className="w-6 h-6" /> },
    { key: 'armor', label: 'Armure', icon: <Shield className="w-6 h-6" /> },
    { key: 'helmet', label: 'Casque', icon: <Crown className="w-6 h-6" /> },
    { key: 'boots', label: 'Bottes', icon: <Shirt className="w-6 h-6" /> },
    { key: 'accessory', label: 'Accessoire', icon: <Gem className="w-6 h-6" /> },
  ];

  return (
    <Card className="w-full bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Package className="w-6 h-6" />
          <span>Inventaire & Équipement</span>
        </CardTitle>
        <CardDescription className="text-gray-400">
          Gérez vos objets et équipements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-700">
            <TabsTrigger value="inventory" className="data-[state=active]:bg-blue-600">
              <Package className="w-4 h-4 mr-2" />
              Inventaire ({inventory.length})
            </TabsTrigger>
            <TabsTrigger value="equipment" className="data-[state=active]:bg-blue-600">
              <Sword className="w-4 h-4 mr-2" />
              Équipement
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-4">
            <ScrollArea className="h-[400px] w-full">
              {inventory.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {inventory.map((item, index) => (
                    <ItemCard key={`${item.id}-${index}`} item={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Votre inventaire est vide</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="equipment" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {equipmentSlots.map(slot => {
                const equippedItem = equipped_items[slot.key];
                return (
                  <Card key={slot.key} className="bg-gray-700 border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        {slot.icon}
                        <h3 className="text-white font-medium">{slot.label}</h3>
                      </div>
                      
                      {equippedItem ? (
                        <ItemCard 
                          item={equippedItem} 
                          isEquipped={true} 
                          slot={slot.key} 
                        />
                      ) : (
                        <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center text-gray-400">
                          <div className="opacity-50 mb-2">
                            {slot.icon}
                          </div>
                          <p className="text-sm">Aucun équipement</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default InventoryManager;


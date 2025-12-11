export interface RuleCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
  display_order: number;
  visible: boolean;
}

export interface Rule {
  id: number;
  category_id: number;
  title: string;
  description: string;
  display_order: number;
  visible: boolean;
}

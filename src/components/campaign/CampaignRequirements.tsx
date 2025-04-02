
import React from "react";
import { CampaignData } from "@/pages/CampaignQuotation";
import NeuCard from "@/components/NeuCard";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, Plus, X } from "lucide-react";

interface CampaignRequirementsProps {
  data: CampaignData;
  updateData: (data: Partial<CampaignData>) => void;
}

const formSchema = z.object({
  industry: z.string().min(1, "Please select an industry"),
  ageGroups: z.array(z.string()).min(1, "Select at least one age group"),
  gender: z.array(z.string()).min(1, "Select at least one gender"),
  interests: z.array(z.string()),
  cities: z.array(z.string()),
  states: z.array(z.string()),
  tierLevels: z.array(z.string()).min(1, "Select at least one tier level"),
  objectives: z.array(z.string()).min(1, "Select at least one objective"),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  budget: z.number().min(1, "Budget must be greater than 0"),
  assetCategories: z.array(z.string()).min(1, "Select at least one asset category"),
});

const CampaignRequirements: React.FC<CampaignRequirementsProps> = ({
  data,
  updateData,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      industry: data.industry,
      ageGroups: data.demographics.ageGroups,
      gender: data.demographics.gender,
      interests: data.demographics.interests,
      cities: data.geographics.cities,
      states: data.geographics.states,
      tierLevels: data.geographics.tierLevels,
      objectives: data.objectives,
      startDate: data.duration.startDate,
      endDate: data.duration.endDate,
      budget: data.budget,
      assetCategories: data.assetCategories,
    },
  });

  const [newInterest, setNewInterest] = React.useState("");
  const [newCity, setNewCity] = React.useState("");
  const [newState, setNewState] = React.useState("");

  const industries = [
    "Technology",
    "Finance",
    "Healthcare",
    "Education",
    "Entertainment",
    "Retail",
    "Food & Beverage",
    "Travel",
    "Automotive",
    "Real Estate",
  ];

  const ageGroups = [
    "13-17",
    "18-24",
    "25-34",
    "35-44",
    "45-54",
    "55-64",
    "65+",
  ];

  const genderOptions = ["Male", "Female", "Non-binary", "Other"];

  const tierLevels = ["Tier 1", "Tier 2", "Tier 3"];

  const campaignObjectives = [
    "Branding",
    "Performance",
    "Engagement",
    "Awareness",
    "Conversion",
  ];

  const assetCategoryOptions = ["Digital", "Physical", "Phygital"];

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    updateData({
      industry: values.industry,
      demographics: {
        ageGroups: values.ageGroups,
        gender: values.gender,
        interests: values.interests,
      },
      geographics: {
        cities: values.cities,
        states: values.states,
        tierLevels: values.tierLevels,
      },
      objectives: values.objectives,
      duration: {
        startDate: values.startDate,
        endDate: values.endDate,
      },
      budget: values.budget,
      assetCategories: values.assetCategories,
    });
  };

  React.useEffect(() => {
    const subscription = form.watch((value) => {
      handleSubmit(value as z.infer<typeof formSchema>);
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const addInterest = () => {
    if (!newInterest.trim()) return;
    const currentInterests = form.getValues("interests") || [];
    form.setValue("interests", [...currentInterests, newInterest.trim()]);
    setNewInterest("");
  };

  const removeInterest = (interest: string) => {
    const currentInterests = form.getValues("interests") || [];
    form.setValue(
      "interests",
      currentInterests.filter((i) => i !== interest)
    );
  };

  const addCity = () => {
    if (!newCity.trim()) return;
    const currentCities = form.getValues("cities") || [];
    form.setValue("cities", [...currentCities, newCity.trim()]);
    setNewCity("");
  };

  const removeCity = (city: string) => {
    const currentCities = form.getValues("cities") || [];
    form.setValue(
      "cities",
      currentCities.filter((c) => c !== city)
    );
  };

  const addState = () => {
    if (!newState.trim()) return;
    const currentStates = form.getValues("states") || [];
    form.setValue("states", [...currentStates, newState.trim()]);
    setNewState("");
  };

  const removeState = (state: string) => {
    const currentStates = form.getValues("states") || [];
    form.setValue(
      "states",
      currentStates.filter((s) => s !== state)
    );
  };

  return (
    <div>
      <Form {...form}>
        <form className="space-y-6">
          {/* Industry Selection */}
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="neu-pressed dark:bg-gray-800">
                      <SelectValue placeholder="Select an industry" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Demographics Section */}
          <NeuCard className="p-4">
            <h3 className="text-lg font-semibold mb-4">Demographics</h3>

            {/* Age Groups */}
            <div className="mb-4">
              <FormField
                control={form.control}
                name="ageGroups"
                render={() => (
                  <FormItem>
                    <FormLabel>Age Groups</FormLabel>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {ageGroups.map((age) => (
                        <FormField
                          key={age}
                          control={form.control}
                          name="ageGroups"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={age}
                                className="flex flex-row items-start space-x-2 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(age)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, age])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== age
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {age}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Gender */}
            <div className="mb-4">
              <FormField
                control={form.control}
                name="gender"
                render={() => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <div className="flex flex-wrap gap-4 mt-2">
                      {genderOptions.map((gender) => (
                        <FormField
                          key={gender}
                          control={form.control}
                          name="gender"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={gender}
                                className="flex flex-row items-start space-x-2 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(gender)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, gender])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== gender
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {gender}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Interests */}
            <div>
              <FormLabel>Interests</FormLabel>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Add an interest"
                  className="neu-pressed dark:bg-gray-800"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addInterest();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addInterest}
                  className="neu-flat dark:bg-gray-800"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {form.watch("interests")?.map((interest, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-neugray-200 dark:bg-gray-700 px-2 py-1 rounded-md"
                  >
                    <span>{interest}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => removeInterest(interest)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </NeuCard>

          {/* Geographics Section */}
          <NeuCard className="p-4">
            <h3 className="text-lg font-semibold mb-4">Geographics</h3>

            {/* Cities */}
            <div className="mb-4">
              <FormLabel>Cities</FormLabel>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="Add a city"
                  className="neu-pressed dark:bg-gray-800"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCity();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addCity}
                  className="neu-flat dark:bg-gray-800"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {form.watch("cities")?.map((city, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-neugray-200 dark:bg-gray-700 px-2 py-1 rounded-md"
                  >
                    <span>{city}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => removeCity(city)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* States */}
            <div className="mb-4">
              <FormLabel>States</FormLabel>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  value={newState}
                  onChange={(e) => setNewState(e.target.value)}
                  placeholder="Add a state"
                  className="neu-pressed dark:bg-gray-800"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addState();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addState}
                  className="neu-flat dark:bg-gray-800"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {form.watch("states")?.map((state, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-neugray-200 dark:bg-gray-700 px-2 py-1 rounded-md"
                  >
                    <span>{state}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => removeState(state)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tier Levels */}
            <div>
              <FormField
                control={form.control}
                name="tierLevels"
                render={() => (
                  <FormItem>
                    <FormLabel>Tier Levels</FormLabel>
                    <div className="flex flex-wrap gap-4 mt-2">
                      {tierLevels.map((tier) => (
                        <FormField
                          key={tier}
                          control={form.control}
                          name="tierLevels"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={tier}
                                className="flex flex-row items-start space-x-2 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(tier)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, tier])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== tier
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {tier}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </NeuCard>

          {/* Campaign Objectives */}
          <FormField
            control={form.control}
            name="objectives"
            render={() => (
              <FormItem>
                <FormLabel>Campaign Objectives</FormLabel>
                <div className="flex flex-wrap gap-3 mt-2">
                  {campaignObjectives.map((objective) => (
                    <FormField
                      key={objective}
                      control={form.control}
                      name="objectives"
                      render={({ field }) => {
                        return (
                          <div
                            key={objective}
                            className={`px-3 py-2 rounded-lg cursor-pointer ${
                              field.value?.includes(objective)
                                ? "bg-primary text-white"
                                : "bg-neugray-200 dark:bg-gray-700 text-foreground"
                            }`}
                            onClick={() => {
                              const updatedValue = field.value?.includes(objective)
                                ? field.value.filter((val) => val !== objective)
                                : [...(field.value || []), objective];
                              field.onChange(updatedValue);
                            }}
                          >
                            {objective}
                          </div>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campaign Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal neu-flat dark:bg-gray-800",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal neu-flat dark:bg-gray-800",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() ||
                          (form.getValues("startDate") &&
                            date < form.getValues("startDate"))
                        }
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Budget */}
          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Budget (INR)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter budget amount"
                    className="neu-pressed dark:bg-gray-800"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? 0 : parseInt(value, 10));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Asset Categories */}
          <FormField
            control={form.control}
            name="assetCategories"
            render={() => (
              <FormItem>
                <FormLabel>Preferred Asset Categories</FormLabel>
                <div className="flex flex-wrap gap-4 mt-2">
                  {assetCategoryOptions.map((category) => (
                    <FormField
                      key={category}
                      control={form.control}
                      name="assetCategories"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={category}
                            className="flex flex-row items-start space-x-2 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(category)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, category])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== category
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {category}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};

export default CampaignRequirements;

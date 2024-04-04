import {
    Box,
    Button,
    Checkbox,
    Flex,
    Heading,
    Icon,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay, useColorMode,
    useDisclosure,
    useToast,
    InputGroup,
    InputLeftElement,
    Spacer
} from "@chakra-ui/react";
import {AiFillEdit, AiOutlinePlus, BsCheck2, BsFillMoonFill, BsTrashFill, MdCancel, AiOutlineSearch} from "react-icons/all";
import {ChangeEvent, useEffect, useRef, useState} from "react";

function App() {
    const [todos, setTodos] = useState<TodoEntry[]>([]);
    const [nextId, setNextId] = useState<number>(0);

    useEffect(() => {
        const todos = localStorage.getItem("todos_list");
        if (todos === null) {
            return;
        }
        setTodos(JSON.parse(todos));

        const nextId = localStorage.getItem("todo_next_id");
        if (nextId === null) {
            return;
        }
        setNextId(parseInt(nextId));
    }, []);

    const saveTodos = (todos: TodoEntry[]) => {
        localStorage.setItem("todos_list", JSON.stringify(todos));
        setTodos(todos);
    }

    const generateNextId = () => {
        const id = nextId + 1;
        localStorage.setItem("todo_next_id", id.toString());
        setNextId(id);
        return id;
    }

    const {isOpen, onOpen, onClose} = useDisclosure();

    const createInputRef = useRef(null);
    const dateInputRef = useRef(null); // Menambahkan ref untuk input tanggal

    const handleCreate = () => {
        const createInput = createInputRef.current;
        const dateInput = dateInputRef.current;
    
        if (createInput === undefined || createInput === null || dateInput === undefined || dateInput === null) {
            return;
        }
        const text = createInput.value; // Mengambil nilai dari input teks
        const dueDate = new Date(dateInput.value); // Mengubah nilai tanggal menjadi objek Date
    
        if (text === "" || isNaN(dueDate.getTime())) { // Mengecek apakah tanggal valid
            return;
        }
    
        const newTodo = {
            id: generateNextId(),
            text: text,
            dueDate: dueDate, // Menyimpan dueDate sebagai objek Date
            success: false,
            createdAt: new Date()
        };
        saveTodos([...todos, newTodo]);
        onClose();
    }
    
    const {toggleColorMode } = useColorMode()

    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState(todos);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
    };    

    useEffect(() => {
        const results = todos.filter(todo =>
            todo.text.toLowerCase().includes(search.toLowerCase())
        );
        setSearchResults(results);
    }, [todos, search]);


    return (
        <Box>
        <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>
                Tugas Baru
                <ModalCloseButton />
            </ModalHeader>
            <ModalBody pb={8}>
                <Box mb={6}>
                    <Input type={"text"} placeholder={"Deskripsikan tugas"} ref={createInputRef} />
                </Box>
                <Box mb={6}>
                    <Input type={"date"} placeholder={"Pilih Tanggal"} ref={dateInputRef} />
                </Box>
                <Button w={"full"} colorScheme={"blue"} onClick={handleCreate}>
                    Buat
                </Button>
            </ModalBody>
        </ModalContent>
    </Modal>
        <Box px={4} py={2} mb={2}>
            <Heading textAlign={"center"}>Todo List</Heading>
        </Box>
        <Flex justifyContent={"space-between"} mb={4} px={2} gap={2}>
            <InputGroup>
                <InputLeftElement
                    pointerEvents="none"
                    children={<AiOutlineSearch color="gray.300" />}
                />
                <Input 
                    type="text" 
                    placeholder="Cari tugas" 
                    onChange={handleSearch}
                    focusBorderColor="blue.500"
                    _placeholder={{ color: "gray.500" }}
                />
            </InputGroup>
            <Flex gap={2}>
                <Button colorScheme={"blue"} size={"sm"}
                        onClick={toggleColorMode}>
                    <Icon as={BsFillMoonFill} w={5} h={5}/>
                </Button>
                <Spacer />
                <Button colorScheme={"blue"} size={"sm"} leftIcon={<Icon as={AiOutlinePlus} w={5} h={5}/>}
                        onClick={onOpen}>
                    Tambahkan
                </Button>
            </Flex>
        </Flex>
        <Box px={2}>
            <Flex gap={2} flexDirection={"column"}>
                {searchResults.map((todo, index) => {
                    return <Todo key={index} id={index} todo={todo} todos={todos} setTodos={saveTodos}/>
                })}
                {searchResults.length === 0 && <Box textAlign={"center"} fontSize={"2xl"}>Tidak ada tugas</Box>}
            </Flex>
        </Box>
    </Box>
    );
}

interface TodoEntry {
    id: number
    text: string
    dueDate: Date // Menambahkan properti dueDate
    success: boolean
    createdAt: Date
}

interface TodoProps {
    id: number
    todo: TodoEntry
    todos: TodoEntry[]
    setTodos: (todos: TodoEntry[]) => void
}

function Todo(props: TodoProps) {
    const toast = useToast();

    const isMobile = window.innerWidth <= 768;

    const [checked, setChecked] = useState(props.todo.success);

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const updatedTodo = {...props.todo, success: e.target.checked};
        const updatedTodos = props.todos.map(todo => todo.id === props.todo.id ? updatedTodo : todo);
        props.setTodos(updatedTodos);
        setChecked(e.target.checked);

        if (e.target.checked) {
            toast({
                description: <Box>Tugas <Box as={"span"} fontWeight={"bold"}>{props.todo.text}</Box> telah ditandai
                    selesai</Box>,
                status: "success",
                duration: 3000,
                isClosable: true,
                position: isMobile ? "bottom" : "top-right",
            })
        }
    }

    const onDelete = () => {
        const updatedTodos = props.todos.filter(todo => todo.id !== props.todo.id);
        props.setTodos(updatedTodos);
        toast({
            description: <Box>Tugas <Box as={"span"} fontWeight={"bold"}>{props.todo.text}</Box> telah dihapus</Box>,
            status: "warning",
            duration: 3000,
            isClosable: true,
            position: isMobile ? "bottom" : "top-right",
        })
    }

    const editInputRef = useRef(null);
    const dateInputRef = useRef(null);

    const onEdit = () => {
        const editInput = editInputRef.current;
        const dateInput = dateInputRef.current; // Ambil nilai dari input tanggal
        if (editInput === undefined || editInput === null || dateInput === undefined || dateInput === null) {
            return;
        }
        const text = editInput;
        const dueDate = dateInput; // Ambil nilai tanggal
        if (text === "" || dueDate === "") {
            return;
        }
        const updatedTodo = { ...props.todo, text, dueDate: new Date(dueDate) }; // Perbarui dueDate juga
        const updatedTodos = props.todos.map(todo => todo.id === props.todo.id ? updatedTodo : todo);
        props.setTodos(updatedTodos);
        setIsEditing(false);
    }

    const [isEditing, setIsEditing] = useState(false);

    return (
        <Flex rounded={"lg"} px={4} py={2} border={"1px"} borderColor={"gray.800"} _dark={{borderColor: "gray.50"}} alignItems={"center"} gap={1}>
                <Checkbox onChange={onChange} isChecked={checked} mx={1}/>
                <Box flex={"auto"} fontWeight={"semibold"} fontSize={"lg"}>
                    {!isEditing && (
                        <Box>
                            <Box wordBreak={"break-all"}>{props.todo.text}</Box>
                            <Box fontSize={"sm"} color={"gray.500"}>
                                Due Date: {props.todo.dueDate ? props.todo.dueDate.toLocaleDateString() : '-'}
                            </Box>
                        </Box>
                    )}
                {isEditing && (
                    <Flex direction={"column"} gap={2}>
                        <Input type={"text"} size={"sm"} fontSize={"lg"} fontWeight={"semibold"} rounded={"xl"} defaultValue={props.todo.text} ref={editInputRef} />
                        <Input type={"date"} size={"sm"} fontSize={"lg"} fontWeight={"semibold"} rounded={"xl"} defaultValue={props.todo.dueDate} ref={dateInputRef} />
                    </Flex>
                )}
            </Box>
                {!isEditing &&
                    <>
                        <Button size={"sm"} colorScheme={"red"} onClick={onDelete}>
                            <Icon as={BsTrashFill} w={5} h={5} color={"white"}/>
                        </Button>
                        <Button size={"sm"} colorScheme={"green"} onClick={() => setIsEditing(true)}>
                            <Icon as={AiFillEdit} w={5} h={5} color={"white"}/>
                        </Button>
                    </>
                }
                {isEditing &&
                    <>
                        <Button size={"sm"} colorScheme={"green"} onClick={onEdit}>
                            <Icon as={BsCheck2} w={5} h={5} color={"white"}/>
                        </Button>

                        <Button size={"sm"} colorScheme={"red"} onClick={() => setIsEditing(false)}>
                            <Icon as={MdCancel} w={5} h={5} color={"white"}/>
                        </Button>
                    </>}
            </Flex>
    );
}

export default App
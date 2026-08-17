// ========================================
// سجل البيانات
// ========================================

const nameInput = document.getElementById("nameInput");
const nationalIdInput = document.getElementById("nationalIdInput");
const addBtn = document.getElementById("addBtn");

const searchInput = document.getElementById("searchInput");
const dataTable = document.getElementById("dataTable");

const countElement = document.getElementById("count");
const emptyMessage = document.getElementById("emptyMessage");

const clearBtn = document.getElementById("clearBtn");
const idMessage = document.getElementById("idMessage");


// ========================================
// تحميل البيانات من الجهاز
// ========================================

let people = JSON.parse(localStorage.getItem("peopleData")) || [];

let editIndex = null;


// ========================================
// حفظ البيانات
// ========================================

function saveData() {

    localStorage.setItem(
        "peopleData",
        JSON.stringify(people)
    );

}


// ========================================
// تنظيف الرقم القومي
// ========================================

nationalIdInput.addEventListener("input", function () {

    // السماح بالأرقام فقط
    this.value = this.value.replace(/\D/g, "");

    if (this.value.length === 14) {

        idMessage.textContent = "✓ الرقم مكون من 14 رقم";
        idMessage.style.color = "#16a34a";

    } else {

        idMessage.textContent =
            `متبقي ${14 - this.value.length} رقم`;

        idMessage.style.color = "#64748b";
    }

});


// ========================================
// إضافة شخص
// ========================================

addBtn.addEventListener("click", function () {

    const name = nameInput.value.trim();
    const nationalId = nationalIdInput.value.trim();


    // التحقق من الاسم
    if (name === "") {

        alert("من فضلك اكتب الاسم");

        nameInput.focus();

        return;
    }


    // التحقق من الرقم
    if (!/^\d{14}$/.test(nationalId)) {

        alert("الرقم القومي يجب أن يكون 14 رقم بالضبط");

        nationalIdInput.focus();

        return;
    }


    // منع تكرار الرقم القومي
    const duplicate = people.some(
        person => person.nationalId === nationalId
    );

    if (duplicate) {

        alert("هذا الرقم القومي مسجل بالفعل");

        return;
    }


    // إضافة البيانات
    people.push({

        name: name,

        nationalId: nationalId,

        createdAt: new Date().toISOString()

    });


    // حفظ
    saveData();


    // تنظيف الحقول
    nameInput.value = "";
    nationalIdInput.value = "";

    idMessage.textContent = "";


    // تحديث الجدول
    render();


    nameInput.focus();

});


// ========================================
// عرض البيانات
// ========================================

function render() {

    const search = searchInput.value
        .trim()
        .toLowerCase();


    const filtered = people.filter(person => {

        return (
            person.name.toLowerCase().includes(search) ||
            person.nationalId.includes(search)
        );

    });


    dataTable.innerHTML = "";


    filtered.forEach((person, index) => {

        const realIndex = people.indexOf(person);


        const row = document.createElement("tr");


        row.innerHTML = `

            <td class="number">
                ${realIndex + 1}
            </td>

            <td>
                ${escapeHTML(person.name)}
            </td>

            <td class="national-id">
                ${person.nationalId}
            </td>

            <td>

                <div class="actions">

                    <button
                        class="edit-btn"
                        onclick="editPerson(${realIndex})"
                    >
                        تعديل
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deletePerson(${realIndex})"
                    >
                        حذف
                    </button>

                </div>

            </td>

        `;


        dataTable.appendChild(row);

    });


    // العدد
    countElement.textContent = people.length;


    // إظهار رسالة فارغة
    if (filtered.length === 0) {

        emptyMessage.style.display = "block";

    } else {

        emptyMessage.style.display = "none";

    }

}


// ========================================
// البحث
// ========================================

searchInput.addEventListener("input", render);


// ========================================
// حذف شخص
// ========================================

function deletePerson(index) {

    const person = people[index];


    const confirmDelete = confirm(
        `هل أنت متأكد من حذف:\n\n${person.name}`
    );


    if (!confirmDelete) {
        return;
    }


    people.splice(index, 1);


    saveData();

    render();

}


// ========================================
// نافذة التعديل
// ========================================

const editModal = document.getElementById("editModal");

const editName = document.getElementById("editName");
const editNationalId = document.getElementById("editNationalId");

const saveEdit = document.getElementById("saveEdit");
const cancelEdit = document.getElementById("cancelEdit");
const closeModal = document.getElementById("closeModal");


// ========================================
// فتح التعديل
// ========================================

function editPerson(index) {

    editIndex = index;


    editName.value = people[index].name;

    editNationalId.value = people[index].nationalId;


    editModal.classList.add("show");

}


// ========================================
// إغلاق التعديل
// ========================================

function closeEditModal() {

    editModal.classList.remove("show");

    editIndex = null;

}


closeModal.addEventListener(
    "click",
    closeEditModal
);


cancelEdit.addEventListener(
    "click",
    closeEditModal
);


// ========================================
// حفظ التعديل
// ========================================

saveEdit.addEventListener("click", function () {

    if (editIndex === null) {
        return;
    }


    const name = editName.value.trim();

    const nationalId = editNationalId.value.trim();


    if (name === "") {

        alert("من فضلك اكتب الاسم");

        return;
    }


    if (!/^\d{14}$/.test(nationalId)) {

        alert("الرقم القومي يجب أن يكون 14 رقم بالضبط");

        return;
    }


    // التأكد من عدم تكرار الرقم
    const duplicate = people.some(
        (person, index) =>
            person.nationalId === nationalId &&
            index !== editIndex
    );


    if (duplicate) {

        alert("هذا الرقم القومي موجود بالفعل");

        return;
    }


    people[editIndex].name = name;

    people[editIndex].nationalId = nationalId;


    saveData();

    render();

    closeEditModal();

});


// ========================================
// حذف كل البيانات
// ========================================

clearBtn.addEventListener("click", function () {

    if (people.length === 0) {

        alert("لا توجد بيانات لحذفها");

        return;
    }


    const confirmation = confirm(
        "⚠️ هل أنت متأكد؟\n\nسيتم حذف جميع البيانات نهائيًا من هذا المتصفح."
    );


    if (!confirmation) {
        return;
    }


    people = [];


    saveData();

    render();

});


// ========================================
// إغلاق النافذة عند الضغط خارجها
// ========================================

editModal.addEventListener("click", function (event) {

    if (event.target === editModal) {

        closeEditModal();

    }

});


// ========================================
// حماية عرض الاسم من HTML
// ========================================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// ========================================
// تشغيل الموقع
// ========================================

render();
